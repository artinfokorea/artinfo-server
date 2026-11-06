import * as fs from 'fs';
import * as Sharp from 'sharp';
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
 *    - imageUrl 은 소스가 준 URL 그대로 (null 이면 null)
 * 2) 두 번 등록해도 등록 계정은 한 번만 조회
 * 3) findRegisteredJobId 는 같은 URL 의 채용 id
 * 4) 전공은 선택 — 제목·본문에 전공 낱말이 없으면 majorIds [] 로 그대로 등록한다 (전공 조회도 하지 않는다)
 * 5) 공고문 파일 없이 본문 이미지(PNG)만 있으면 sharp 로 WebP 로 바꿔 올리고 등록한다 (attachment '본문 이미지 N장', 실제 크기)
 *    파일 + 이미지가 모두 있으면 파일 페이지 뒤에 이미지가 붙고, 둘 다 없으면 실패
 */
const LOGO = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/4637/images/20261020/original/cLa2DrY-gIr.1792501357272.png';

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
  imageUrl: LOGO,
  date: '2026-10-20',
  ...over,
});

describe('JobSourceSupport', () => {
  it('WebP 를 올리고 대표 이미지 URL 로 채용을 만든다', async () => {
    const { support, calls } = build();
    const result = await support.register(input());

    expect(result).toEqual({ jobId: 701, title: input().title, url: input().url, attachment: '공고문.hwpx', pageCount: 2, majors: ['TRUMPET', 'SOPRANO'] });
    const pageKeys = calls.uploads.map(u => u[0]);
    expect(calls.uploads.map(u => u[1])).toEqual(['image/webp', 'image/webp']);
    expect(pageKeys[0]).toMatch(/^upload\/42\/jobs\/20261020\/original\/[A-Za-z0-9_-]{11}\.\d+\.webp$/);

    const command = calls.commands[0];
    expect(command).toMatchObject({
      userId: 42,
      type: 'ART_ORGANIZATION',
      title: '2026년도 목포시립예술단 단원 공개채용 공고',
      companyName: '목포시립예술단',
      address: '전남광주통합특별시 목포시 양을로 203',
      addressDetail: '목포시청 3층 문화예술과',
      recruitSiteUrl: 'https://www.mokpo.go.kr/x?idx=55362',
      imageUrl: LOGO,
      majorIds: [26, 10],
      fee: null,
    });
    expect(command.contents).toBe(
      `<p>모집인원 : 교향악단 트럼펫 1, 합창단 소프라노 1</p>` +
        `<figure class="image"><img style="aspect-ratio:1587/2245;" src="https://artinfo.s3.ap-northeast-2.amazonaws.com/${pageKeys[0]}" width="1587" height="2245"></figure>` +
        `<figure class="image"><img style="aspect-ratio:1587/2245;" src="https://artinfo.s3.ap-northeast-2.amazonaws.com/${pageKeys[1]}" width="1587" height="2245"></figure>`,
    );
  });

  it('두 번 등록해도 등록 계정 조회는 한 번', async () => {
    const { support, calls } = build();
    await support.register(input());
    await support.register(input({ url: 'https://www.mokpo.go.kr/x?idx=2' }));
    expect(calls.userLookups).toBe(1);
    expect(calls.commands).toHaveLength(2);
  });

  it('이미지가 없으면 imageUrl 은 null', async () => {
    const { support, calls } = build();
    await support.register(input({ imageUrl: null }));
    expect(calls.commands[0].imageUrl).toBeNull();
  });

  it('전공 낱말이 없으면 전공 없이 등록한다', async () => {
    const { support, calls } = build();
    const result = await support.register(
      input({
        source: 'bucheon',
        title: '[공고] 부천시립합창단 상임단원 채용 공고',
        bodyText: '',
        url: 'https://www.bucheonphil.or.kr/front/M0000025/article/view.do?atcId=AT026086',
      }),
    );
    expect(result.majors).toEqual([]);
    expect(result.jobId).toBe(701);
    expect(calls.commands).toHaveLength(1);
    expect(calls.commands[0].majorIds).toEqual([]);
    expect(calls.commands[0].title).toBe('[공고] 부천시립합창단 상임단원 채용 공고');
  });

  it('공고문 파일 없이 본문 이미지만 있으면 WebP 로 바꿔 올린다', async () => {
    const png = await Sharp({ create: { width: 4, height: 6, channels: 3, background: { r: 200, g: 30, b: 30 } } })
      .png()
      .toBuffer();
    const { support, calls } = build();
    const result = await support.register(
      input({
        file: undefined,
        images: [
          { name: 'a.png', buffer: png },
          { name: 'b.png', buffer: png },
        ],
      }),
    );

    expect(result).toMatchObject({ attachment: '본문 이미지 2장', pageCount: 2 });
    expect(calls.uploads.map(([key, mime]) => [key.replace(/\/[^/]+\.webp$/, '/*.webp'), mime])).toEqual([
      ['upload/42/jobs/20261020/original/*.webp', 'image/webp'],
      ['upload/42/jobs/20261020/original/*.webp', 'image/webp'],
    ]);
    expect(calls.commands[0].contents).toContain('<figure class="image"><img style="aspect-ratio:4/6;"');
    expect(calls.commands[0].contents.match(/<figure/g)).toHaveLength(2);
    expect(calls.commands[0].contents).toContain('width="4" height="6"');
  });

  it('파일과 이미지가 모두 있으면 파일 페이지 뒤에 이미지가 붙고, 둘 다 없으면 실패', async () => {
    const png = await Sharp({ create: { width: 3, height: 5, channels: 3, background: '#fff' } })
      .png()
      .toBuffer();
    const { support, calls } = build();
    const result = await support.register(input({ images: [{ name: 'a.png', buffer: png }] }));
    expect(result).toMatchObject({ attachment: '공고문.hwpx', pageCount: 3 });
    expect(calls.commands[0].contents.match(/aspect-ratio:(\d+\/\d+)/g)).toEqual(['aspect-ratio:1587/2245', 'aspect-ratio:1587/2245', 'aspect-ratio:3/5']);

    await expect(build().support.register(input({ file: undefined, images: [] }))).rejects.toThrow('공고문 파일도 본문 이미지도 없음');
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

describe('JobSourceSupport.logoUrl', () => {
  it('로고 파일을 upload/{userId}/jobs/logo/{source}.png 로 한 번만 올리고 URL 을 돌려준다', async () => {
    const { support, calls } = build();
    const first = await support.logoUrl('boryeong', 'assets/job-crawler/boryeong.png');
    const second = await support.logoUrl('boryeong', 'assets/job-crawler/boryeong.png');
    expect(first).toBe('https://artinfo.s3.ap-northeast-2.amazonaws.com/upload/42/jobs/logo/boryeong.png');
    expect(second).toBe(first);
    expect(calls.uploads).toEqual([['upload/42/jobs/logo/boryeong.png', 'image/png', fs.statSync('assets/job-crawler/boryeong.png').size]]);
    expect(calls.userLookups).toBe(1);
  });

  it('파일이 없으면 실패하고 다음 호출에서 다시 시도한다', async () => {
    const { support, calls } = build();
    await expect(support.logoUrl('x', 'assets/job-crawler/없음.png')).rejects.toThrow();
    await expect(support.logoUrl('x', 'assets/job-crawler/없음.png')).rejects.toThrow();
    expect(calls.uploads).toEqual([]);
  });
});
