/**
 * 시설 사진을 우리 S3(artinfo 버킷)로 정리한다.
 *
 * 살펴는 지금까지 각 조리원 공식 홈페이지의 이미지 URL 을 그대로 참조했다. 조리원이 홈페이지를
 * 개편하면 사진이 깨지고, 핫링크를 막으면 안 보이고, 남의 서버 트래픽을 쓰게 된다. 그래서 사진을
 * 내려받아 우리 버킷에 public-read 로 올리고 URL 을 바꾼다.
 *
 * 두 단계이고, 각각 껐다 켤 수 있으며 몇 번을 다시 돌려도 안전하다(이미 우리 버킷인 URL 은 건너뛴다).
 *   1) --from-seed : 시드 상수에는 있는데 DB 행에는 사진이 비어 있으면 먼저 채운다.
 *      부트스트랩이 더 이상 기존 행을 덮어쓰지 않으므로(원천이 DB), 배포만으로는 사진이 들어가지 않는다.
 *   2) 재호스팅   : DB 의 외부 URL 사진을 내려받아 S3 에 올리고 URL 을 바꾼다.
 *
 * 사용:
 *   DATABASE_HOST=... DATABASE_PORT=... DATABASE_USER_NAME=... DATABASE_PASSWORD=... DATABASE_NAME=... \
 *   AWS_ACCESS_KEY=... AWS_SECRET_ACCESS_KEY=... AWS_REGION=ap-northeast-2 NODE_ENV=production \
 *   npx ts-node -r tsconfig-paths/register src/salpyeo/scripts/rehost-facility-images.ts [--from-seed] [--dry-run] [--limit N]
 *
 * 저작권: 조리원 홈페이지 사진을 우리 서버로 옮겨 재배포하는 것이라, 원본 출처가 남도록
 * 시설의 website 를 함께 표기하는 것을 전제로 한다. 사용 중지 요청이 오면 해당 시설 사진을 지우면 된다.
 */
import { DataSource } from 'typeorm';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import * as path from 'path';
import * as sharp from 'sharp';
import { SALPYEO_FACILITY_SEED } from '@/salpyeo/facility/domain/constant/salpyeo-facility-seed.constant';
import { SalpyeoFacilityImage } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';

const BUCKET = 'artinfo';
const DOWNLOAD_TIMEOUT_MS = 15_000;
const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED_MIME: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

interface FacilityRow {
  slug: string;
  images: SalpyeoFacilityImage[] | null;
}

const argv = process.argv.slice(2);
const options = {
  fromSeed: argv.includes('--from-seed'),
  dryRun: argv.includes('--dry-run'),
  limit: (() => {
    const i = argv.indexOf('--limit');
    return i >= 0 ? Number(argv[i + 1]) : Infinity;
  })(),
};

const isOurBucket = (url: string) => url.includes(`${BUCKET}.s3.`);

function makeS3Client(): S3Client {
  return new S3Client({
    credentials: { accessKeyId: process.env['AWS_ACCESS_KEY']!, secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY']! },
    region: process.env['AWS_REGION'],
  });
}

async function download(url: string): Promise<{ buffer: Buffer; mimetype: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
  try {
    // 일부 홈페이지는 Referer 없는 요청을 막는다 — 원본 페이지에서 온 것처럼 보이게 한다
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; salpyeo-image-rehost/1.0)', Referer: new URL(url).origin },
    });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0 || buffer.length > MAX_BYTES) return null;

    // Content-Type 을 못 믿는 서버가 있어 실제 바이트로 형식을 다시 확인한다
    const meta = await sharp(buffer).metadata();
    const mimetype = meta.format === 'png' ? 'image/png' : meta.format === 'webp' ? 'image/webp' : meta.format === 'jpeg' ? 'image/jpeg' : '';
    if (!ALLOWED_MIME[mimetype]) return null;

    return { buffer, mimetype };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function upload(s3: S3Client, slug: string, index: number, file: { buffer: Buffer; mimetype: string }): Promise<string> {
  const key = path.posix.join(process.env['NODE_ENV']!, 'salpyeo', 'facilities', slug, `${index}-${Date.now()}.${ALLOWED_MIME[file.mimetype]}`);
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return `https://${BUCKET}.s3.${process.env['AWS_REGION']}.amazonaws.com/${key}`;
}

/** 시드에는 있는데 DB 가 비어 있는 시설의 사진을 채운다 (부트스트랩이 기존 행을 덮어쓰지 않으므로) */
async function backfillFromSeed(dataSource: DataSource): Promise<number> {
  const seedImages = new Map(SALPYEO_FACILITY_SEED.filter(s => s.images.length > 0).map(s => [s.slug, s.images]));
  if (seedImages.size === 0) {
    console.log('[from-seed] 시드에 사진이 없습니다 — 건너뜁니다');
    return 0;
  }

  const empty: FacilityRow[] = await dataSource.query(`SELECT slug, images FROM salpyeo_facilities WHERE images IS NULL OR jsonb_array_length(images) = 0`);
  let filled = 0;

  for (const row of empty) {
    const images = seedImages.get(row.slug);
    if (!images?.length) continue;

    if (!options.dryRun) {
      await dataSource.query(`UPDATE salpyeo_facilities SET images = $1::jsonb, updated_at = now() WHERE slug = $2`, [JSON.stringify(images), row.slug]);
    }
    filled += 1;
  }

  console.log(`[from-seed] 사진이 비어 있던 ${empty.length}곳 중 ${filled}곳을 시드 사진으로 채웠습니다${options.dryRun ? ' (dry-run)' : ''}`);
  return filled;
}

async function rehost(dataSource: DataSource, s3: S3Client): Promise<void> {
  const rows: FacilityRow[] = await dataSource.query(
    `SELECT slug, images FROM salpyeo_facilities WHERE images IS NOT NULL AND jsonb_array_length(images) > 0 ORDER BY slug`,
  );

  let facilities = 0;
  let moved = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    if (facilities >= options.limit) break;

    const images = row.images ?? [];
    const external = images.filter(image => !isOurBucket(image.url));
    if (external.length === 0) continue;
    facilities += 1;

    const next: SalpyeoFacilityImage[] = [];
    for (const [index, image] of images.entries()) {
      if (isOurBucket(image.url)) {
        next.push(image);
        skipped += 1;
        continue;
      }

      const file = await download(image.url);
      if (!file) {
        // 내려받지 못한 사진은 원래 URL 그대로 남긴다 — 지우면 복구할 방법이 없다
        console.warn(`  실패 ${row.slug} #${index} ${image.url}`);
        next.push(image);
        failed += 1;
        continue;
      }

      if (options.dryRun) {
        next.push(image);
      } else {
        next.push({ ...image, url: await upload(s3, row.slug, index, file) });
      }
      moved += 1;
    }

    if (!options.dryRun) {
      await dataSource.query(`UPDATE salpyeo_facilities SET images = $1::jsonb, updated_at = now() WHERE slug = $2`, [JSON.stringify(next), row.slug]);
    }
    console.log(`${row.slug}: ${external.length}장 처리 (누적 이동 ${moved} · 실패 ${failed})`);
  }

  console.log(
    `\n완료 — 시설 ${facilities}곳 · 이동 ${moved}장 · 이미 우리 버킷 ${skipped}장 · 실패 ${failed}장${options.dryRun ? ' (dry-run, 아무것도 바뀌지 않음)' : ''}`,
  );
}

async function main() {
  if (!process.env['NODE_ENV']) throw new Error('NODE_ENV 가 필요합니다 (S3 키 앞에 붙는 경로).');
  if (!options.dryRun && !process.env['AWS_ACCESS_KEY']) throw new Error('AWS_ACCESS_KEY 가 필요합니다.');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env['DATABASE_HOST'],
    port: Number(process.env['DATABASE_PORT']),
    username: process.env['DATABASE_USER_NAME'],
    password: process.env['DATABASE_PASSWORD'],
    database: process.env['DATABASE_NAME'],
    synchronize: false,
  });
  await dataSource.initialize();

  try {
    if (options.fromSeed) await backfillFromSeed(dataSource);
    await rehost(dataSource, makeS3Client());
  } finally {
    await dataSource.destroy();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
