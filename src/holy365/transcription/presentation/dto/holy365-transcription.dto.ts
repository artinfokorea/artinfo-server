import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class Holy365SubmitVerseRequest {
  @IsString()
  @MaxLength(16)
  @ApiProperty({ example: 'NKRV' })
  versionCode: string;

  @IsInt()
  @Min(1)
  @Max(66)
  @ApiProperty({ example: 1 })
  book: number;

  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  chapter: number;

  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  verse: number;

  @IsString()
  @MaxLength(2000)
  @ApiProperty({ example: '태초에 하나님이 천지를 창조하시니라' })
  typed: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false, description: '이 절을 쓰는 데 걸린 초 (최대 600초로 자른다)' })
  seconds?: number;
}

export class Holy365ChapterQuery {
  @IsString()
  @MaxLength(16)
  @ApiProperty({ example: 'NKRV' })
  version: string;

  @Type(() => Number)
  @IsInt()
  @ApiProperty({ example: 1 })
  book: number;

  @Type(() => Number)
  @IsInt()
  @ApiProperty({ example: 1 })
  chapter: number;
}

export class Holy365VersionQuery {
  @IsString()
  @MaxLength(16)
  @ApiProperty({ example: 'NKRV' })
  version: string;
}

export class Holy365DailyQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiProperty({ required: false, example: 182, description: '오늘 포함 최근 n일 (1~400)' })
  days?: number;
}

export class Holy365ChapterStateResponse {
  @ApiProperty()
  versionCode: string;

  @ApiProperty()
  book: number;

  @ApiProperty()
  chapter: number;

  @ApiProperty()
  verseCount: number;

  @ApiProperty({ description: '이 장을 완주한 횟수' })
  passes: number;

  @ApiProperty({ description: '지금 회차(passes+1)에서 쓴 절 수' })
  inPass: number;

  @ApiProperty({ type: 'array', items: { type: 'object', properties: { verse: { type: 'number' }, count: { type: 'number' } } } })
  counts: { verse: number; count: number }[];
}

export class Holy365SubmitVerseResponse {
  @ApiProperty({ description: 'false 면 중복 전송이라 횟수를 올리지 않았다' })
  counted: boolean;

  @ApiProperty({ type: Holy365ChapterStateResponse })
  chapter: Holy365ChapterStateResponse;
}

export class Holy365SummaryResponse {
  @ApiProperty({ description: '번역본별 완주 횟수 · 이번 회차 진행 · 마지막 위치' })
  versions: object[];

  @ApiProperty()
  totals: object;

  @ApiProperty()
  streak: object;

  @ApiProperty()
  today: object;
}

export class Holy365BooksProgressResponse {
  @ApiProperty({ description: '성경 전체 완주 횟수' })
  completedRounds: number;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  books: object[];
}

export class Holy365DailyResponse {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  days: object[];
}
