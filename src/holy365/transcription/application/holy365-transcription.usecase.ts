import { Injectable } from '@nestjs/common';
import { Holy365BibleRepository } from '@/holy365/bible/infrastructure/holy365-bible.repository';
import { Holy365TranscriptionRepository } from '@/holy365/transcription/infrastructure/holy365-transcription.repository';
import { isValidChapter } from '@/holy365/bible/domain/holy365-books';
import { isTypedMatch, normalizeVerseText } from '@/holy365/transcription/domain/holy365-typing';
import { chapterProgress, clampSeconds, completedPasses, Holy365CountBucket, streakOf } from '@/holy365/transcription/domain/holy365-progress';
import { kstDateOf, kstDaysAgo, kstYearStartUtc } from '@/holy365/common/holy365-kst';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

export interface Holy365ChapterState {
  versionCode: string;
  book: number;
  chapter: number;
  verseCount: number;
  passes: number;
  inPass: number;
  counts: { verse: number; count: number }[];
}

export interface Holy365VersionSummary {
  code: string;
  name: string;
  language: string;
  totalVerses: number;
  completedRounds: number;
  currentRoundVerses: number;
  typedVerses: number;
  last: { book: number; chapter: number; verse: number; at: Date | null } | null;
}

export interface Holy365BookProgress {
  book: number;
  verseCount: number;
  passes: number;
  doneForRound: number;
  completedChapters: number;
  chapters: { chapter: number; verseCount: number; passes: number; inPass: number }[];
}

function toBuckets(counts: { count: number }[]): Holy365CountBucket[] {
  const map = new Map<number, number>();
  counts.forEach(({ count }) => map.set(count, (map.get(count) ?? 0) + 1));

  return [...map.entries()].map(([count, n]) => ({ count, n }));
}

@Injectable()
export class Holy365TranscriptionUseCase {
  constructor(
    private readonly bibleRepository: Holy365BibleRepository,
    private readonly transcriptionRepository: Holy365TranscriptionRepository,
  ) {}

  async submitVerse(
    userId: number,
    input: { versionCode: string; book: number; chapter: number; verse: number; typed: string; seconds: number },
  ): Promise<{ counted: boolean; chapter: Holy365ChapterState }> {
    if (!isValidChapter(input.book, input.chapter)) throw Holy365Errors.chapterNotFound();
    const text = await this.bibleRepository.verse(input.versionCode, input.book, input.chapter, input.verse);
    if (text === null) throw Holy365Errors.chapterNotFound();
    if (!isTypedMatch(text, input.typed)) throw Holy365Errors.typedMismatch();

    const counted = await this.transcriptionRepository.record({
      userId,
      versionCode: input.versionCode,
      book: input.book,
      chapter: input.chapter,
      verse: input.verse,
      chars: normalizeVerseText(text).length,
      seconds: clampSeconds(input.seconds),
      day: kstDateOf(new Date()),
    });

    return { counted, chapter: await this.chapterState(userId, input.versionCode, input.book, input.chapter) };
  }

  async chapterState(userId: number, versionCode: string, book: number, chapter: number): Promise<Holy365ChapterState> {
    if (!isValidChapter(book, chapter)) throw Holy365Errors.chapterNotFound();
    const verseCount = await this.bibleRepository.verseCountOf(versionCode, book, chapter);
    if (!verseCount) throw Holy365Errors.chapterNotFound();

    const counts = await this.transcriptionRepository.chapterVerseCounts(userId, versionCode, book, chapter);
    const { passes, inPass } = chapterProgress(verseCount, toBuckets(counts), 0);

    return { versionCode, book, chapter, verseCount, passes, inPass, counts };
  }

  async summary(userId: number) {
    const [versions, counts, totals] = await Promise.all([
      this.bibleRepository.versions(),
      this.transcriptionRepository.versionCounts(userId),
      this.transcriptionRepository.totals(userId),
    ]);

    const summaries: Holy365VersionSummary[] = await Promise.all(
      versions.map(async version => {
        const row = counts.find(count => count.versionCode === version.code);
        const completedRounds = completedPasses(version.verseCount, row?.typed ?? 0, row?.minCount ?? 0);
        const currentRoundVerses = row ? await this.transcriptionRepository.countAbove(userId, version.code, completedRounds) : 0;

        return {
          code: version.code,
          name: version.name,
          language: version.language,
          totalVerses: version.verseCount,
          completedRounds,
          currentRoundVerses,
          typedVerses: row?.typed ?? 0,
          last: row?.lastBook ? { book: row.lastBook, chapter: row.lastChapter!, verse: row.lastVerse!, at: row.lastAt } : null,
        };
      }),
    );

    const today = kstDateOf(new Date());
    const todayRow = (await this.transcriptionRepository.daily(userId, today))[0];

    return {
      versions: summaries,
      totals: { verses: totals.verses, chars: totals.chars, seconds: totals.seconds, activeDays: totals.activeDays.length },
      streak: streakOf(totals.activeDays, today),
      today: { verses: todayRow?.verses ?? 0, chars: todayRow?.chars ?? 0, seconds: todayRow?.seconds ?? 0 },
    };
  }

  async books(userId: number, versionCode: string): Promise<{ completedRounds: number; books: Holy365BookProgress[] }> {
    const version = await this.bibleRepository.findVersion(versionCode);
    if (!version) throw Holy365Errors.versionNotFound();

    const [chapters, buckets] = await Promise.all([
      this.bibleRepository.chapters(versionCode),
      this.transcriptionRepository.chapterBuckets(userId, versionCode),
    ]);

    const bucketMap = new Map<string, Holy365CountBucket[]>();
    buckets.forEach(bucket => {
      const key = `${bucket.book}:${bucket.chapter}`;
      bucketMap.set(key, [...(bucketMap.get(key) ?? []), { count: bucket.count, n: bucket.n }]);
    });

    const typed = buckets.reduce((sum, bucket) => sum + bucket.n, 0);
    const minCount = buckets.length ? Math.min(...buckets.map(bucket => bucket.count)) : 0;
    const completedRounds = completedPasses(version.verseCount, typed, minCount);

    const books = new Map<number, Holy365BookProgress>();
    chapters.forEach(row => {
      const progress = chapterProgress(row.verseCount, bucketMap.get(`${row.book}:${row.chapter}`) ?? [], completedRounds);
      const book = books.get(row.book) ?? {
        book: row.book,
        verseCount: 0,
        passes: Number.MAX_SAFE_INTEGER,
        doneForRound: 0,
        completedChapters: 0,
        chapters: [],
      };
      book.verseCount += row.verseCount;
      book.passes = Math.min(book.passes, progress.passes);
      book.doneForRound += progress.doneForRound;
      book.completedChapters += progress.passes > 0 ? 1 : 0;
      book.chapters.push({ chapter: row.chapter, verseCount: row.verseCount, passes: progress.passes, inPass: progress.inPass });
      books.set(row.book, book);
    });

    return { completedRounds, books: [...books.values()] };
  }

  /** 올해(1월 1일, 한국 시간부터) 권별 진행 — 한 번이라도 쓴 절 / 권 전체 절 */
  async yearBooks(userId: number, versionCode: string) {
    const version = await this.bibleRepository.findVersion(versionCode);
    if (!version) throw Holy365Errors.versionNotFound();

    const today = kstDateOf(new Date());
    const [chapters, typed] = await Promise.all([
      this.bibleRepository.chapters(versionCode),
      this.transcriptionRepository.versesTypedSince(userId, versionCode, kstYearStartUtc(today)),
    ]);
    const doneOf = new Map(typed.map(row => [row.book, row.done]));
    const totals = new Map<number, { verseCount: number; chapterCount: number }>();
    chapters.forEach(row => {
      const book = totals.get(row.book) ?? { verseCount: 0, chapterCount: 0 };
      totals.set(row.book, { verseCount: book.verseCount + row.verseCount, chapterCount: book.chapterCount + 1 });
    });

    const books = [...totals.entries()].map(([book, total]) => ({
      book,
      chapterCount: total.chapterCount,
      verseCount: total.verseCount,
      done: Math.min(doneOf.get(book) ?? 0, total.verseCount),
    }));
    return { year: Number(today.slice(0, 4)), books, totalVerses: version.verseCount, done: books.reduce((sum, book) => sum + book.done, 0) };
  }

  daily(userId: number, days: number) {
    const span = Math.min(Math.max(Math.floor(days) || 0, 1), 400);

    return this.transcriptionRepository.daily(userId, kstDaysAgo(span - 1));
  }
}
