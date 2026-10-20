import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { DocumentConverterService } from '@/document-converter/service/document-converter.service';
import { CreateJobCommand } from '@/job/dto/command/create-job.command';
import { Job } from '@/job/entity/job.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { JobService } from '@/job/service/job.service';
import { UserRepository } from '@/user/repository/user.repository';
import { JobSourceSupport, NoticeRegistration, buildContentsHtml } from './job-source.support';

/**
 * 스펙 (변환·S3·DB 는 가짜):
 * 1) 공고문 → WebP 2장 업로드(upload/{userId}/jobs/20261020/original/*.webp) → 채용 생성
 *    - userId · type ART_ORGANIZATION · 제목 · 단체명 · 주소/상세 · recruitSiteUrl · 전공 id(TRUMPET, SOPRANO) · contents 마크업
 *    - 로고가 있으면 assets 파일을 upload/job-crawler/{source}/{파일} 에 올리고 imageUrl 로 쓴다 (두 번 등록해도 한 번만 업로드)
 * 2) 로고가 없으면 imageUrl null, 등록 계정은 한 번만 조회
 * 3) 로고 파일이 없으면 등록이 실패한다 (조용히 null 로 넘어가지 않음)
 * 4) findRegisteredJobId 는 같은 URL 의 채용 id
 */
const assetsDir = path.join(__dirname, '..', 'assets');
const logoFile = path.join(assetsDir, 'test-logo.png');
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

function build(opts: { existing?: number } = {}) {
  const calls = { uploads: [] as [string, string, number][], commands: [] as CreateJobCommand[], userLookups: 0 };
  const converter = {
    convertToWebp: async (_buf: Buffer, name: string) => ({
      originalName: name,
      kind: 'hwp',
      pageCount: 2,
      scale: 2,
      quality: 80,
      elapsedMs: 1,
      pages: [1, 2].map(n => ({ page: n, width: 1587, height: 2245, bytes: 3, data: Buffer.from('img') })),
    }),
  } as unknown as DocumentConverterService;
  const s3 = {
    uploadStream: async (buf: Buffer, mime: string, key: string) => {
      calls.uploads.push([key, mime, buf.length]);
      return { key, tag: '', location: `https://artinfo.s3.ap-northeast-2.amazonaws.com/${key}` };
    },
  } as unknown as AwsS3Service;
  const jobService = {
    createJob: async (command: CreateJobCommand) => {
      calls.commands.push(command);
      return 700 + calls.commands.length;
    },
  } as unknown as JobService;
  const userRepository = {
    findOneOrThrowByEmail: async () => {
      calls.userLookups += 1;
      return { id: 42 };
    },
  } as unknown as UserRepository;
  const jobRepository = { findOne: async () => (opts.existing ? { id: opts.existing } : null) } as unknown as Repository<Job>;
  const majorRepository = {
    findBy: async (where: { enName: { _value: string[] } }) => where.enName._value.map(name => ({ id: name === 'TRUMPET' ? 26 : 10, enName: name })),
  } as unknown as Repository<MajorCategory>;
  return { support: new JobSourceSupport(converter, s3, jobService, userRepository, jobRepository, majorRepository), calls };
}

const input = (over: Partial<NoticeRegistration> = {}): NoticeRegistration => ({
  source: 'mokpo',
  title: '2026년도 목포시립예술단 단원 공개채용 공고',
  url: 'https://www.mokpo.go.kr/x?idx=55362',
  bodyText: '모집인원 : 교향악단 트럼펫 1, 합창단 소프라노 1',
  file: { name: '공고문.hwpx', buffer: Buffer.from('hwpx') },
  companyName: '목포시립예술단',
  address: '전남광주통합특별시 목포시 양을로 203',
  addressDetail: '목포시청 3층 문화예술과',
  logoAsset: 'test-logo.png',
  date: '2026-10-20',
  ...over,
});

describe('JobSourceSupport', () => {
  beforeAll(() => {
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.writeFileSync(logoFile, PNG_1PX);
  });
  afterAll(() => {
    fs.rmSync(logoFile, { force: true });
  });

  it('WebP 를 올리고 로고를 대표 이미지로 채용을 만든다', async () => {
    const { support, calls } = build();
    const result = await support.register(input());

    expect(result).toEqual({ jobId: 701, title: input().title, url: input().url, attachment: '공고문.hwpx', pageCount: 2, majors: ['TRUMPET', 'SOPRANO'] });
    const pageKeys = calls.uploads.filter(u => u[1] === 'image/webp').map(u => u[0]);
    expect(pageKeys).toHaveLength(2);
    expect(pageKeys[0]).toMatch(/^upload\/42\/jobs\/20261020\/original\/[A-Za-z0-9_-]{11}\.\d+\.webp$/);
    expect(calls.uploads.filter(u => u[1] === 'image/png')).toEqual([['upload/job-crawler/mokpo/test-logo.png', 'image/png', PNG_1PX.length]]);

    const command = calls.commands[0];
    expect(command).toMatchObject({
      userId: 42,
      type: 'ART_ORGANIZATION',
      title: '2026년도 목포시립예술단 단원 공개채용 공고',
      companyName: '목포시립예술단',
      address: '전남광주통합특별시 목포시 양을로 203',
      addressDetail: '목포시청 3층 문화예술과',
      recruitSiteUrl: 'https://www.mokpo.go.kr/x?idx=55362',
      imageUrl: 'https://artinfo.s3.ap-northeast-2.amazonaws.com/upload/job-crawler/mokpo/test-logo.png',
      majorIds: [26, 10],
      fee: null,
    });
    expect(command.contents).toBe(
      `<p>모집인원 : 교향악단 트럼펫 1, 합창단 소프라노 1</p>` +
        `<figure class="image"><img style="aspect-ratio:1587/2245;" src="https://artinfo.s3.ap-northeast-2.amazonaws.com/${pageKeys[0]}" width="1587" height="2245"></figure>` +
        `<figure class="image"><img style="aspect-ratio:1587/2245;" src="https://artinfo.s3.ap-northeast-2.amazonaws.com/${pageKeys[1]}" width="1587" height="2245"></figure>`,
    );
  });

  it('두 번 등록해도 로고 업로드와 계정 조회는 한 번', async () => {
    const { support, calls } = build();
    await support.register(input());
    await support.register(input({ url: 'https://www.mokpo.go.kr/x?idx=2' }));
    expect(calls.uploads.filter(u => u[1] === 'image/png')).toHaveLength(1);
    expect(calls.userLookups).toBe(1);
    expect(calls.commands).toHaveLength(2);
  });

  it('로고가 없으면 imageUrl 은 null', async () => {
    const { support, calls } = build();
    await support.register(input({ logoAsset: undefined }));
    expect(calls.commands[0].imageUrl).toBeNull();
    expect(calls.uploads.every(u => u[1] === 'image/webp')).toBe(true);
  });

  it('로고 파일이 없으면 등록이 실패한다', async () => {
    const { support, calls } = build();
    await expect(support.register(input({ logoAsset: 'missing.png' }))).rejects.toThrow(/로고 업로드 실패/);
    expect(calls.commands).toEqual([]);
  });

  it('findRegisteredJobId 는 같은 URL 의 채용 id', async () => {
    expect(await build({ existing: 9 }).support.findRegisteredJobId('u')).toBe(9);
    expect(await build().support.findRegisteredJobId('u')).toBeNull();
  });
});

describe('buildContentsHtml', () => {
  it('본문은 <p>, 이미지는 <figure class="image">, HTML 은 이스케이프', () => {
    expect(buildContentsHtml('가 <b>\n\n나 & 다', [{ url: 'https://x/1.webp', width: 10, height: 20 }])).toBe(
      '<p>가 &lt;b&gt;</p><p>나 &amp; 다</p><figure class="image"><img style="aspect-ratio:10/20;" src="https://x/1.webp" width="10" height="20"></figure>',
    );
  });
});
