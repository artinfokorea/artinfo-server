import { Body, Param, ParseIntPipe, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { UploadFile } from '@/common/type/type';
import { Holy365Auth, Holy365OptionalUser, Holy365Signature, Holy365User } from '@/holy365/common/holy365-auth.guard';
import { Holy365FeedService } from '@/holy365/feed/holy365-feed.service';
import { HOLY365_ASPECTS, Holy365Aspect, HOLY365_POST_MAX_IMAGES, HOLY365_POST_MAX_PASSAGES } from '@/holy365/feed/domain/holy365-post-policy';
import { HOLY365_AVATAR_MAX_BYTES } from '@/holy365/user/domain/service/holy365-avatar-policy';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

class Holy365VerseInput {
  @IsString()
  @MaxLength(16)
  @ApiProperty({ example: 'NKRV' })
  versionCode: string;

  @IsInt()
  @ApiProperty({ example: 43 })
  book: number;

  @IsInt()
  @ApiProperty({ example: 3 })
  chapter: number;

  @IsInt()
  @ApiProperty({ example: 16 })
  verseStart: number;

  @IsInt()
  @ApiProperty({ example: 16 })
  verseEnd: number;
}

class Holy365CreatePostRequest {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @ApiProperty({ required: false })
  content?: string;

  @IsIn(HOLY365_ASPECTS)
  @ApiProperty({ enum: HOLY365_ASPECTS })
  aspect: Holy365Aspect;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(HOLY365_POST_MAX_IMAGES)
  @IsString({ each: true })
  @ApiProperty({ required: false, type: [String], description: 'POST /feed/images 로 받은 주소' })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(HOLY365_POST_MAX_PASSAGES)
  @ValidateNested({ each: true })
  @Type(() => Holy365VerseInput)
  @ApiProperty({ required: false, type: [Holy365VerseInput], description: '붙일 구절 (같은 장의 연속 범위, 최대 5개)' })
  verses?: Holy365VerseInput[];
}

class Holy365FeedQuery {
  @IsOptional()
  @Matches(/^(all|following|user:\d+)$/)
  @ApiProperty({ required: false, example: 'all', description: 'all · following · user:{id}' })
  scope?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ required: false, description: '이 게시물 id 보다 오래된 것부터 (다음 페이지)' })
  before?: number;
}

class Holy365AspectQuery {
  @IsIn(HOLY365_ASPECTS)
  @ApiProperty({ enum: HOLY365_ASPECTS })
  aspect: Holy365Aspect;
}

class Holy365CommentRequest {
  @IsString()
  @MaxLength(1000)
  @ApiProperty()
  content: string;
}

class Holy365ReportRequest {
  @IsIn(['post', 'comment'])
  @ApiProperty({ enum: ['post', 'comment'] })
  targetType: 'post' | 'comment';

  @IsInt()
  @Min(1)
  @Max(2147483647)
  @ApiProperty()
  targetId: number;

  @IsString()
  @MaxLength(500)
  @ApiProperty()
  reason: string;
}

class Holy365FeedResponse {
  @ApiProperty({ description: '응답 본문 — 각 API 설명 참고' })
  item: object;
}

/** 피드 — 글 · 사진(1:1 / 4:5, 최대 10장) · 성경 구절 */
@RestApiController('/holy365/feed', 'Holy365 Feed')
export class Holy365FeedController {
  constructor(private readonly feedService: Holy365FeedService) {}

  @Holy365Auth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @UseInterceptors(FilesInterceptor('files', HOLY365_POST_MAX_IMAGES, { limits: { fileSize: HOLY365_AVATAR_MAX_BYTES } }))
  @RestApiPost(Holy365FeedResponse, { path: '/images', description: '사진 올리기 (?aspect=1:1|4:5) — 받은 주소를 게시물에 넣는다' })
  async uploadImages(@Holy365User() user: Holy365Signature, @Query() query: Holy365AspectQuery, @UploadedFiles() files: UploadFile[]) {
    return { urls: await this.feedService.uploadImages(user.id, query.aspect, files) };
  }

  @Holy365Auth()
  @RestApiPost(Holy365FeedResponse, { path: '/posts', description: '게시물 올리기' })
  create(@Holy365User() user: Holy365Signature, @Body() request: Holy365CreatePostRequest) {
    return this.feedService.create(user.id, request);
  }

  @RestApiGet(Holy365FeedResponse, { path: '/posts', description: '피드 — scope=all(기본) · following(로그인) · user:{id}, before 로 다음 페이지' })
  list(@Query() query: Holy365FeedQuery, @Holy365OptionalUser() viewer: Holy365Signature | null) {
    const scope = query.scope ?? 'all';
    if (scope === 'following') {
      if (!viewer) throw Holy365Errors.unauthorized();
      return this.feedService.list({ kind: 'following', userId: viewer.id }, viewer.id, query.before ?? null);
    }
    if (scope.startsWith('user:')) return this.feedService.list({ kind: 'user', userId: Number(scope.slice(5)) }, viewer?.id ?? null, query.before ?? null);
    return this.feedService.list({ kind: 'all' }, viewer?.id ?? null, query.before ?? null);
  }

  @RestApiGet(Holy365FeedResponse, { path: '/posts/:id', description: '게시물 하나' })
  get(@Param('id', ParseIntPipe) id: number, @Holy365OptionalUser() viewer: Holy365Signature | null) {
    return this.feedService.get(id, viewer?.id ?? null);
  }

  @Holy365Auth()
  @RestApiDelete(OkResponse, { path: '/posts/:id', description: '내 게시물 지우기 (댓글·사진도 함께)' })
  async remove(@Param('id', ParseIntPipe) id: number, @Holy365User() user: Holy365Signature) {
    await this.feedService.remove(id, user.id);
  }

  @Holy365Auth()
  @RestApiPost(Holy365FeedResponse, { path: '/posts/:id/like', description: '좋아요' })
  like(@Param('id', ParseIntPipe) id: number, @Holy365User() user: Holy365Signature) {
    return this.feedService.like(id, user.id, true);
  }

  @Holy365Auth()
  @RestApiDelete(Holy365FeedResponse, { path: '/posts/:id/like', description: '좋아요 취소' })
  unlike(@Param('id', ParseIntPipe) id: number, @Holy365User() user: Holy365Signature) {
    return this.feedService.like(id, user.id, false);
  }

  @RestApiGet(Holy365FeedResponse, { path: '/posts/:id/comments', description: '댓글 목록 (오래된 순)' })
  async comments(@Param('id', ParseIntPipe) id: number) {
    return { comments: await this.feedService.comments(id) };
  }

  @Holy365Auth()
  @RestApiPost(Holy365FeedResponse, { path: '/posts/:id/comments', description: '댓글 쓰기 (1~500자)' })
  async addComment(@Param('id', ParseIntPipe) id: number, @Holy365User() user: Holy365Signature, @Body() request: Holy365CommentRequest) {
    return { comments: await this.feedService.addComment(id, user.id, request.content) };
  }

  @Holy365Auth()
  @RestApiDelete(OkResponse, { path: '/comments/:id', description: '댓글 지우기 (댓글 쓴 사람 · 게시물 주인)' })
  async removeComment(@Param('id', ParseIntPipe) id: number, @Holy365User() user: Holy365Signature) {
    await this.feedService.removeComment(id, user.id);
  }

  @Holy365Auth()
  @RestApiPost(OkResponse, { path: '/reports', description: '게시물 · 댓글 신고' })
  async report(@Holy365User() user: Holy365Signature, @Body() request: Holy365ReportRequest) {
    await this.feedService.report(user.id, request.targetType, request.targetId, request.reason);
  }
}
