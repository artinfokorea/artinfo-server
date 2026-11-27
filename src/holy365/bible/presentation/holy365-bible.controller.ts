import { Param, ParseIntPipe } from '@nestjs/common';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { Holy365BibleRepository } from '@/holy365/bible/infrastructure/holy365-bible.repository';
import { Holy365BookListResponse, Holy365ChapterTextResponse, Holy365VersionListResponse } from '@/holy365/bible/presentation/dto/holy365-bible.dto';
import { isValidChapter } from '@/holy365/bible/domain/holy365-books';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

@RestApiController('/holy365/bible', 'Holy365 Bible')
export class Holy365BibleController {
  constructor(private readonly bibleRepository: Holy365BibleRepository) {}

  @RestApiGet(Holy365VersionListResponse, { path: '/versions', description: '번역본 목록 (본문이 들어온 것만)' })
  async versions() {
    return new Holy365VersionListResponse(await this.bibleRepository.versions());
  }

  @RestApiGet(Holy365BookListResponse, { path: '/versions/:code/books', description: '권 · 장 · 절 수' })
  async books(@Param('code') code: string) {
    if (!(await this.bibleRepository.findVersion(code))) throw Holy365Errors.versionNotFound();

    return new Holy365BookListResponse(await this.bibleRepository.chapters(code));
  }

  @RestApiGet(Holy365ChapterTextResponse, { path: '/versions/:code/books/:book/chapters/:chapter', description: '장 본문' })
  async chapter(@Param('code') code: string, @Param('book', ParseIntPipe) book: number, @Param('chapter', ParseIntPipe) chapter: number) {
    if (!isValidChapter(book, chapter)) throw Holy365Errors.chapterNotFound();
    const verses = await this.bibleRepository.verses(code, book, chapter);
    if (!verses.length) throw Holy365Errors.chapterNotFound();

    return new Holy365ChapterTextResponse(code, book, chapter, verses);
  }
}
