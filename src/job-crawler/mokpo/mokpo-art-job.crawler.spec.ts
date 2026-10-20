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
import { MokpoNoticeClient } from './mokpo-notice.client';
import { MokpoArtJobCrawler, buildContentsHtml } from './mokpo-art-job.crawler';
import { MokpoNoticeGateway } from './mokpo-notice.client';

/**
 * 스펙 (사이트·변환·S3·DB 는 가짜, 파서는 실제 픽스처):
 * 1) 2026-10-20 목록(그날 14건 + 10-19 1건) 중 "목포시립예술단 … 채용" 1건 → 공고문 hwpx 다운로드 → WebP 2장 S3 업로드 → 채용 1건 등록
 *    - 1페이지에 전날 행이 있으므로 2페이지는 읽지 않는다
 *    - 제목 · 단체명 목포시립예술단 · 주소 전라남도 목포시 · recruitSiteUrl = 공고 URL · 전공 TRUMPET, SOPRANO 의 id · type ART_ORGANIZATION
 *    - contents 는 본문 <p> 뒤에 <figure class="image"> 2개, S3 경로는 upload/{userId}/jobs/20261020/original/*.webp
 * 2) 같은 URL 이 이미 있으면 skipped (다운로드·등록 안 함)
 * 3) 다른 날짜면 scanned 0 · matched 0 이고 등록 계정 조회도 안 한다
 * 4) 다운로드 실패는 failed 로 모이고 나머지 흐름은 계속된다
 * 5) 1페이지가 모두 그날이면 2페이지를 읽고, 전날 행이 나오거나 빈 페이지면 멈춘다
 */
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');
const olderPage = fixture('list-2026-10-20.html').replace(/2026-10-20/g, '2026-10-19');
/** 15행 모두 그날인 1페이지 (픽스처의 10-19 행을 10-20 으로) */
const fullTodayPage = fixture('list-2026-10-20.html').replace(/2026-10-19/g, '2026-10-20');

function build(opts: { existing?: number; downloadError?: string; pages?: Record<number, string> } = {}) {
  const calls = {
    list: [] as number[],
    detail: [] as string[],
    download: [] as string[],
    uploads: [] as string[],
    commands: [] as CreateJobCommand[],
    userLookups: 0,
  };
  const gateway: MokpoNoticeGateway = {
    fetchListPage: async page => {
      calls.list.push(page);
      return opts.pages?.[page] ?? (page === 1 ? fixture('list-2026-10-20.html') : olderPage);
    },
    fetchDetail: async idx => {
      calls.detail.push(idx);
      return {
        url: `https://www.mokpo.go.kr/www/mokpo_news/notification/public_notice?idx=${idx}&mode=view`,
        html: fixture('detail-55362.html'),
        cookies: ['SESSION=1'],
      };
    },
    downloadAttachment: async (_page, _token, att) => {
      calls.download.push(att.name);
      if (opts.downloadError) throw new Error(opts.downloadError);
      return Buffer.from('hwpx');
    },
  };
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
    uploadStream: async (_b: Buffer, _m: string, key: string) => {
      calls.uploads.push(key);
      return { key, tag: '', location: `https://artinfo.s3.ap-northeast-2.amazonaws.com/${key}` };
    },
  } as unknown as AwsS3Service;
  const jobService = {
    createJob: async (command: CreateJobCommand) => {
      calls.commands.push(command);
      return 777;
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

  const crawler = new MokpoArtJobCrawler({} as MokpoNoticeClient, converter, s3, jobService, userRepository, jobRepository, majorRepository, gateway);
  return { crawler, calls };
}

describe('MokpoArtJobCrawler', () => {
  it('그날 채용 공고 1건을 WebP 로 바꿔 채용으로 등록한다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-10-20');

    expect(summary.scanned).toBe(14);
    expect(summary.matched).toBe(1);
    expect(summary.created).toHaveLength(1);
    expect(summary.skipped).toEqual([]);
    expect(summary.failed).toEqual([]);
    expect(summary.created[0]).toMatchObject({
      jobId: 777,
      pageCount: 2,
      attachment: '(공고문) 2026 시립예술단 단원 채용 모집 공고.hwpx',
      majors: ['TRUMPET', 'SOPRANO'],
    });

    expect(calls.list).toEqual([1]);
    expect(calls.detail).toEqual(['55362']);
    expect(calls.download).toEqual(['(공고문) 2026 시립예술단 단원 채용 모집 공고.hwpx']);
    expect(calls.uploads).toHaveLength(2);
    expect(calls.uploads[0]).toMatch(/^upload\/42\/jobs\/20261020\/original\/[A-Za-z0-9_-]{11}\.\d+\.webp$/);

    const command = calls.commands[0];
    expect(command.userId).toBe(42);
    expect(command.type).toBe('ART_ORGANIZATION');
    expect(command.title).toBe('2026년도 목포시립예술단 단원 공개채용 공고');
    expect(command.companyName).toBe('목포시립예술단');
    expect(command.address).toBe('전라남도 목포시');
    expect(command.recruitSiteUrl).toBe('https://www.mokpo.go.kr/www/mokpo_news/notification/public_notice?idx=55362&mode=view');
    expect(command.majorIds).toEqual([26, 10]);
    expect(command.contents.startsWith('<p>목포시립예술단의 안정적인 운영과')).toBe(true);
    expect(command.contents.match(/<figure class="image">/g)).toHaveLength(2);
    expect(command.contents).toContain(`src="https://artinfo.s3.ap-northeast-2.amazonaws.com/${calls.uploads[1]}"`);
  });

  it('같은 URL 이 이미 등록돼 있으면 건너뛴다', async () => {
    const { crawler, calls } = build({ existing: 5 });
    const summary = await crawler.crawl('2026-10-20');
    expect(summary.created).toEqual([]);
    expect(summary.skipped).toEqual([
      { title: '2026년도 목포시립예술단 단원 공개채용 공고', url: expect.stringContaining('idx=55362'), reason: '이미 등록됨 (job 5)' },
    ]);
    expect(calls.download).toEqual([]);
    expect(calls.commands).toEqual([]);
  });

  it('다른 날짜면 아무것도 하지 않는다', async () => {
    const { crawler, calls } = build();
    const summary = await crawler.crawl('2026-10-21');
    expect(summary.scanned).toBe(0);
    expect(summary.matched).toBe(0);
    expect(calls.list).toEqual([1]);
    expect(calls.userLookups).toBe(0);
  });

  it('다운로드 실패는 failed 에 담긴다', async () => {
    const { crawler, calls } = build({ downloadError: '첨부파일 다운로드 실패' });
    const summary = await crawler.crawl('2026-10-20');
    expect(summary.failed).toEqual([
      { title: '2026년도 목포시립예술단 단원 공개채용 공고', url: expect.stringContaining('idx=55362'), reason: '첨부파일 다운로드 실패' },
    ]);
    expect(calls.commands).toEqual([]);
  });

  it('1페이지가 모두 그날이면 2페이지를 읽고 전날 행이 나오면 멈춘다', async () => {
    const { crawler, calls } = build({ pages: { 1: fullTodayPage, 2: olderPage } });
    const summary = await crawler.crawl('2026-10-20');
    expect(summary.scanned).toBe(15);
    expect(calls.list).toEqual([1, 2]);
  });

  it('빈 페이지가 나오면 멈춘다', async () => {
    const { crawler, calls } = build({ pages: { 1: fullTodayPage, 2: '<html><body><table><tbody></tbody></table></body></html>' } });
    await crawler.crawl('2026-10-20');
    expect(calls.list).toEqual([1, 2]);
  });
});

describe('buildContentsHtml', () => {
  it('본문은 <p>, 이미지는 <figure class="image">, HTML 은 이스케이프', () => {
    expect(buildContentsHtml('가 <b>\n\n나 & 다', [{ url: 'https://x/1.webp', width: 10, height: 20 }])).toBe(
      '<p>가 &lt;b&gt;</p><p>나 &amp; 다</p><figure class="image"><img style="aspect-ratio:10/20;" src="https://x/1.webp" width="10" height="20"></figure>',
    );
  });
});
