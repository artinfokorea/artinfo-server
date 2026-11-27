import {
  aspectSize,
  feedImagePath,
  HOLY365_POST_MAX_IMAGES,
  isFeedImageUrl,
  normalizePostContent,
  validatePostInput,
  validateVerseRange,
} from '@/holy365/feed/domain/holy365-post-policy';

const IMG = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/production/holy365/feed/7/abc.123.webp';

describe('aspectSize — 인스타처럼 두 가지 비율', () => {
  it('1:1 은 1080×1080, 4:5 는 1080×1350', () => {
    expect(aspectSize('1:1')).toEqual({ width: 1080, height: 1080 });
    expect(aspectSize('4:5')).toEqual({ width: 1080, height: 1350 });
  });
});

describe('isFeedImageUrl — 우리 버킷의 피드 경로만', () => {
  it('holy365/feed/{userId}/ 경로면 통과 (그 사용자 것만)', () => {
    expect(isFeedImageUrl(IMG, 7)).toBe(true);
    expect(isFeedImageUrl(IMG, 8)).toBe(false);
  });

  it('다른 호스트·경로는 거부', () => {
    expect(isFeedImageUrl('https://evil.com/production/holy365/feed/7/a.webp', 7)).toBe(false);
    expect(isFeedImageUrl('https://artinfo.s3.ap-northeast-2.amazonaws.com/production/holy365/avatars/7/a.webp', 7)).toBe(false);
    expect(isFeedImageUrl('not a url', 7)).toBe(false);
  });
});

describe('feedImagePath', () => {
  it('holy365/feed/{userId}/{랜덤}.{시각}.webp', () => {
    expect(feedImagePath(7, 'abc', 123)).toBe('holy365/feed/7/abc.123.webp');
  });
});

describe('normalizePostContent', () => {
  it('앞뒤 공백을 걷고 줄바꿈 3개 이상은 2개로', () => {
    expect(normalizePostContent('  오늘 필사\n\n\n\n은혜  ')).toBe('오늘 필사\n\n은혜');
  });
});

describe('validatePostInput — 글·사진·구절 중 하나는 있어야 한다', () => {
  it('글만 있어도 된다', () => {
    expect(validatePostInput({ content: '은혜', imageCount: 0, hasVerse: false })).toBeNull();
  });

  it('사진만 · 구절만 있어도 된다', () => {
    expect(validatePostInput({ content: '', imageCount: 1, hasVerse: false })).toBeNull();
    expect(validatePostInput({ content: '', imageCount: 0, hasVerse: true })).toBeNull();
  });

  it('아무것도 없으면 empty', () => {
    expect(validatePostInput({ content: '  ', imageCount: 0, hasVerse: false })).toBe('empty');
  });

  it('글 2000자 초과 · 사진 10장 초과는 거부', () => {
    expect(validatePostInput({ content: '가'.repeat(2001), imageCount: 0, hasVerse: false })).toBe('tooLong');
    expect(validatePostInput({ content: '', imageCount: HOLY365_POST_MAX_IMAGES + 1, hasVerse: false })).toBe('tooManyImages');
  });
});

describe('validateVerseRange — 한 번에 최대 10절', () => {
  it('시작 ≤ 끝, 10절까지', () => {
    expect(validateVerseRange(1, 1)).toBe(true);
    expect(validateVerseRange(4, 7)).toBe(true);
    expect(validateVerseRange(1, 10)).toBe(true);
  });

  it('거꾸로이거나 너무 길거나 0 이하면 거부', () => {
    expect(validateVerseRange(5, 4)).toBe(false);
    expect(validateVerseRange(1, 11)).toBe(false);
    expect(validateVerseRange(0, 3)).toBe(false);
  });
});
