import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OnchurchWordpressImportUseCase, WordpressPost } from '@/onchurch/importer/onchurch-wordpress-import.usecase';

/**
 * 마스터가 워드프레스 교회 사이트 글을 온교회 교회로 옮긴다 (한 번에 한 쪽씩).
 * 교회 30 (소유자 300) — 매핑: 카테고리 22 → 설교(시리즈 '주일오전설교'), 19 → 교회소식, 20 → 갤러리, 31 → 교제
 * 기대:
 * - 마스터가 아니면 403, 교회가 없으면 404
 * - 설교: 제목 날짜, 유튜브, 담임목사 이름, 본문은 평문 요약, 시리즈는 카테고리 이름으로
 * - 교회소식: 카테고리 이름, 게시일은 원래 글 날짜, 사진은 우리 저장소로 옮긴 주소
 * - 갤러리: 사진마다 한 장씩 같은 묶음, 사진이 없으면 건너뜀
 * - 교제: 소유자 이름(요청의 authorName)으로, 원래 날짜로
 * - 만든 시각·게시 시각은 UTC(dateGmt)로 넣는다 (DB 시각은 UTC)
 * - 이미 옮긴 글은 다시 만들지 않는다 / 매핑하지 않은 카테고리 글은 무시
 * - 사진 하나를 못 옮겨도 글은 옮긴다
 * - 다음 쪽이 있으면 nextPage, 마지막 쪽이면 null
 */
const SITE = 'http://chambit.org';

// date 는 사이트(한국) 시각, dateGmt 는 UTC — DB created_at 은 UTC 로 저장한다
function post(id: number, categories: number[], title: string, content: string, date = '2026-11-26T08:00:00'): WordpressPost {
  const gmt = new Date(`${date}+09:00`).toISOString().slice(0, 19);
  return { id, date, dateGmt: gmt, categories, title, content };
}

function build(options: { role?: string; church?: boolean; imported?: string[]; failImage?: string; totalPages?: number; posts?: WordpressPost[] } = {}) {
  const calls: Record<string, unknown[]> = {
    sermon: [],
    notice: [],
    gallery: [],
    community: [],
    marked: [],
    series: [],
    noticeCat: [],
    galleryCat: [],
    communityCat: [],
  };
  const imported = new Set(options.imported ?? []);
  const userRepository = { findOneOrThrowById: jest.fn().mockResolvedValue({ id: 1, role: options.role ?? 'master' }) };
  const repository = {
    findChurch: jest.fn().mockResolvedValue(options.church === false ? null : { id: 30, ownerId: 300 }),
    isImported: jest.fn(async (_c: number, key: string) => imported.has(key)),
    markImported: jest.fn(async (...a: unknown[]) => void calls.marked.push(a)),
    findOrCreateSermonSeries: jest.fn(async (_c: number, name: string) => (calls.series.push(name), 5)),
    insertSermon: jest.fn(async (row: unknown) => (calls.sermon.push(row), 101)),
    ensureNoticeCategory: jest.fn(async (_c: number, name: string) => void calls.noticeCat.push(name)),
    insertNotice: jest.fn(async (row: unknown) => (calls.notice.push(row), 201)),
    findOrCreateGalleryCategory: jest.fn(async (_c: number, name: string) => (calls.galleryCat.push(name), 7)),
    insertGalleryItems: jest.fn(async (rows: unknown[]) => (calls.gallery.push(rows), [301])),
    ensureCommunityCategory: jest.fn(async (_c: number, name: string) => void calls.communityCat.push(name)),
    insertCommunityPost: jest.fn(async (row: unknown) => (calls.community.push(row), 401)),
  };
  const source = {
    listCategories: jest.fn(),
    listPosts: jest.fn().mockResolvedValue({ posts: options.posts ?? [], totalPages: options.totalPages ?? 1 }),
  };
  const images = {
    copy: jest.fn(async (url: string) => (url === options.failImage ? null : url.replace('http://chambit.org/wp-content/uploads', 'https://cdn/onchurch'))),
  };
  const useCase = new OnchurchWordpressImportUseCase(userRepository as any, repository as any, source as any, images as any);
  return { useCase, calls, repository, source };
}

const MAPPINGS = [
  { categoryId: 22, name: '주일오전설교', target: 'sermon' as const },
  { categoryId: 19, name: '교회소식', target: 'notice' as const },
  { categoryId: 20, name: '사진/영상', target: 'gallery' as const },
  { categoryId: 31, name: '오늘의 말씀', target: 'community' as const },
];
const REQ = { sourceUrl: SITE, mappings: MAPPINGS, pastorName: '임춘수', authorName: '참빛교회', page: 1, perPage: 10 };

describe('OnchurchWordpressImportUseCase', () => {
  it('마스터가 아니면 403, 교회가 없으면 404', async () => {
    await expect(build({ role: 'owner' }).useCase.importPage(1, 30, REQ)).rejects.toThrow(ForbiddenException);
    await expect(build({ church: false }).useCase.importPage(1, 30, REQ)).rejects.toThrow(NotFoundException);
  });

  it('매핑한 카테고리만 오래된 글부터 한 쪽 가져온다', async () => {
    const { useCase, source } = build();
    await useCase.importPage(1, 30, REQ);
    expect(source.listPosts).toHaveBeenCalledWith(SITE, [22, 19, 20, 31], 1, 10);
  });

  it('설교: 제목 날짜·유튜브·담임목사·평문 요약·시리즈', async () => {
    const { useCase, calls } = build({
      posts: [
        post(
          1,
          [22],
          '영광의 보좌 &#8211; 설교(11월 22일 주일 예배 설교)',
          '<iframe src="https://www.youtube.com/embed/kWQ4OOTUysA"></iframe><p>성경 : 마태복음 25:31</p><p>본문</p>',
        ),
      ],
    });
    const result = await useCase.importPage(1, 30, REQ);
    expect(calls.series).toEqual(['주일오전설교']);
    expect(calls.sermon).toEqual([
      {
        churchId: 30,
        seriesId: 5,
        title: '영광의 보좌 – 설교(11월 22일 주일 예배 설교)',
        pastor: '임춘수',
        date: '2026-11-22',
        videoUrl: 'https://www.youtube.com/watch?v=kWQ4OOTUysA',
        summary: '성경 : 마태복음 25:31\n\n본문',
        createdAt: '2026-11-25T23:00:00',
      },
    ]);
    expect(calls.marked).toEqual([[30, 'wp:chambit.org:1', 'sermon', 101]]);
    expect(result).toEqual({ imported: 1, skipped: 0, failed: 0, totalPages: 1, nextPage: null, errors: [] });
  });

  it('교회소식: 카테고리·원래 날짜·옮긴 사진 주소', async () => {
    const { useCase, calls } = build({
      posts: [
        post(
          2,
          [19],
          '11월 22일 주보',
          '<p><a href="https://drive.google.com/x">https://drive.google.com/x</a></p><img src="http://chambit.org/wp-content/uploads/2026/11/b-300x200.jpg">',
          '2026-11-20T09:00:00',
        ),
      ],
    });
    await useCase.importPage(1, 30, REQ);
    expect(calls.noticeCat).toEqual(['교회소식']);
    expect(calls.notice).toEqual([
      {
        churchId: 30,
        category: '교회소식',
        title: '11월 22일 주보',
        content: 'https://drive.google.com/x',
        imageUrls: ['https://cdn/onchurch/2026/11/b.jpg'],
        publishedAt: '2026-11-20T00:00:00',
      },
    ]);
  });

  it('갤러리: 사진마다 한 장씩 같은 묶음, 사진이 없으면 건너뜀', async () => {
    const { useCase, calls } = build({
      posts: [
        post(
          3,
          [20],
          '임직식',
          '<img src="http://chambit.org/wp-content/uploads/a.jpg"><img src="http://chambit.org/wp-content/uploads/b.jpg">',
          '2022-11-25T10:00:00',
        ),
        post(4, [20], '지난 사진(2)', '<p>사진 없음</p>'),
      ],
    });
    const result = await useCase.importPage(1, 30, REQ);
    expect(calls.galleryCat).toEqual(['사진/영상']);
    const rows = calls.gallery[0] as { batchId: string }[];
    expect(rows).toEqual([
      {
        churchId: 30,
        categoryId: 7,
        batchId: rows[0].batchId,
        title: '임직식',
        date: '2022-11-25',
        photoUrl: 'https://cdn/onchurch/a.jpg',
        sortOrder: 0,
        createdAt: '2022-11-25T01:00:00',
      },
      {
        churchId: 30,
        categoryId: 7,
        batchId: rows[0].batchId,
        title: '임직식',
        date: '2022-11-25',
        photoUrl: 'https://cdn/onchurch/b.jpg',
        sortOrder: 1,
        createdAt: '2022-11-25T01:00:00',
      },
    ]);
    expect(rows[0].batchId).toMatch(/^wp-/);
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
  });

  it('교제: 소유자가 요청 이름으로, 원래 날짜로', async () => {
    const { useCase, calls } = build({ posts: [post(5, [31], '11월 26일 오늘의 말씀', '<p>말씀</p><iframe src="https://youtu.be/Gm9nDGhzTcw"></iframe>')] });
    await useCase.importPage(1, 30, REQ);
    expect(calls.communityCat).toEqual(['오늘의 말씀']);
    expect(calls.community).toEqual([
      {
        churchId: 30,
        authorId: 300,
        authorName: '참빛교회',
        category: '오늘의 말씀',
        title: '11월 26일 오늘의 말씀',
        content: '말씀',
        photoUrls: [],
        videoUrl: 'https://www.youtube.com/watch?v=Gm9nDGhzTcw',
        createdAt: '2026-11-25T23:00:00',
      },
    ]);
  });

  it('이미 옮긴 글은 건너뛰고, 매핑 안 한 카테고리 글은 무시한다', async () => {
    const { useCase, calls } = build({ imported: ['wp:chambit.org:6'], posts: [post(6, [19], '옮긴 글', '<p>x</p>'), post(7, [99], '다른 글', '<p>y</p>')] });
    const result = await useCase.importPage(1, 30, REQ);
    expect(calls.notice).toEqual([]);
    expect(result).toMatchObject({ imported: 0, skipped: 2 });
  });

  it('사진 하나를 못 옮겨도 나머지로 글을 옮긴다', async () => {
    const { useCase, calls } = build({
      failImage: 'http://chambit.org/wp-content/uploads/bad.jpg',
      posts: [post(8, [19], '사진 글', '<img src="http://chambit.org/wp-content/uploads/bad.jpg"><img src="http://chambit.org/wp-content/uploads/ok.jpg">')],
    });
    await useCase.importPage(1, 30, REQ);
    expect((calls.notice[0] as { imageUrls: string[] }).imageUrls).toEqual(['https://cdn/onchurch/ok.jpg']);
  });

  it('글 하나가 실패해도 나머지는 옮기고 실패를 알려준다', async () => {
    const { useCase, repository } = build({ posts: [post(9, [19], '실패 글', '<p>a</p>'), post(10, [19], '성공 글', '<p>b</p>')] });
    repository.insertNotice.mockRejectedValueOnce(new Error('db down'));
    const result = await useCase.importPage(1, 30, REQ);
    expect(result).toMatchObject({ imported: 1, failed: 1, errors: ['실패 글: db down'] });
  });

  it('다음 쪽이 있으면 nextPage 를 준다', async () => {
    const { useCase } = build({ totalPages: 3 });
    expect((await useCase.importPage(1, 30, { ...REQ, page: 2 })).nextPage).toBe(3);
    expect((await useCase.importPage(1, 30, { ...REQ, page: 3 })).nextPage).toBeNull();
  });
});
