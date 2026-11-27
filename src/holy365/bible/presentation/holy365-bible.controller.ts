import { Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { Holy365BibleRepository } from '@/holy365/bible/infrastructure/holy365-bible.repository';
import { Holy365BookListResponse, Holy365ChapterTextResponse, Holy365VersionListResponse } from '@/holy365/bible/presentation/dto/holy365-bible.dto';
import { isValidChapter } from '@/holy365/bible/domain/holy365-books';
import { likePattern, searchTerms } from '@/holy365/bible/domain/holy365-search';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

const SEARCH_PAGE_SIZE = 30;

class Holy365BibleSearchQuery {
  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: '사랑 오래 참고', description: '띄어 쓴 단어가 모두 들어간 절을 찾는다' })
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(31000)
  @ApiProperty({ required: false, example: 0 })
  offset?: number;
}

class Holy365BibleSearchResponse {
  @ApiProperty()
  total: number;

  @ApiProperty({ type: [String], description: '실제로 찾은 단어 (강조 표시용)' })
  terms: string[];

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  verses: object[];
}

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

  @RestApiGet(Holy365BibleSearchResponse, { path: '/versions/:code/search', description: '본문 키워드 검색 — 권·장·절 순, 한 번에 30절' })
  async search(@Param('code') code: string, @Query() query: Holy365BibleSearchQuery) {
    if (!(await this.bibleRepository.findVersion(code))) throw Holy365Errors.versionNotFound();
    const terms = searchTerms(query.q);
    if (!terms.length) return { total: 0, terms, verses: [] };

    const { total, hits } = await this.bibleRepository.search(code, terms.map(likePattern), SEARCH_PAGE_SIZE, query.offset ?? 0);
    return { total, terms, verses: hits };
  }

  @RestApiGet(Holy365ChapterTextResponse, { path: '/versions/:code/books/:book/chapters/:chapter', description: '장 본문' })
  async chapter(@Param('code') code: string, @Param('book', ParseIntPipe) book: number, @Param('chapter', ParseIntPipe) chapter: number) {
    if (!isValidChapter(book, chapter)) throw Holy365Errors.chapterNotFound();
    const verses = await this.bibleRepository.verses(code, book, chapter);
    if (!verses.length) throw Holy365Errors.chapterNotFound();

    return new Holy365ChapterTextResponse(code, book, chapter, verses);
  }
}
