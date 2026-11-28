import { Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { Holy365Auth, Holy365OptionalUser, Holy365Signature, Holy365User } from '@/holy365/common/holy365-auth.guard';
import { Holy365SocialService, userCardOf } from '@/holy365/social/holy365-social.service';
import { Holy365SocialRepository } from '@/holy365/social/infrastructure/holy365-social.repository';
import { Holy365TranscriptionUseCase } from '@/holy365/transcription/application/holy365-transcription.usecase';
import { Holy365CreateChurchRequest, Holy365ListQuery, Holy365SearchQuery, Holy365SocialResponse } from '@/holy365/social/presentation/holy365-social.dto';
import { Holy365DailyQuery, Holy365VersionQuery } from '@/holy365/transcription/presentation/dto/holy365-transcription.dto';

/** 다른 사람 프로필 · 팔로우 */
@RestApiController('/holy365/users', 'Holy365 Social')
export class Holy365ProfileController {
  constructor(
    private readonly socialService: Holy365SocialService,
    private readonly socialRepository: Holy365SocialRepository,
    private readonly transcriptionUseCase: Holy365TranscriptionUseCase,
  ) {}

  @RestApiGet(Holy365SocialResponse, { path: '/:id/profile', description: '프로필 — 이름·교회·팔로우 수, 공개면 진행 상황 요약' })
  profile(@Param('id', ParseIntPipe) id: number, @Holy365OptionalUser() viewer: Holy365Signature | null) {
    return this.socialService.profile(id, viewer?.id ?? null);
  }

  @RestApiGet(Holy365SocialResponse, { path: '/:id/progress/books', description: '그 사람의 권·장별 진행 (공개 프로필만)' })
  async books(@Param('id', ParseIntPipe) id: number, @Query() query: Holy365VersionQuery, @Holy365OptionalUser() viewer: Holy365Signature | null) {
    await this.socialService.assertVisible(id, viewer?.id ?? null);
    return this.transcriptionUseCase.books(id, query.version);
  }

  @RestApiGet(Holy365SocialResponse, { path: '/:id/progress/year-books', description: '그 사람의 올해 권별 진행 (공개 프로필만)' })
  async yearBooks(@Param('id', ParseIntPipe) id: number, @Query() query: Holy365VersionQuery, @Holy365OptionalUser() viewer: Holy365Signature | null) {
    await this.socialService.assertVisible(id, viewer?.id ?? null);
    return this.transcriptionUseCase.yearBooks(id, query.version);
  }

  @RestApiGet(Holy365SocialResponse, { path: '/:id/progress/daily', description: '그 사람의 일별 필사량 (공개 프로필만)' })
  async daily(@Param('id', ParseIntPipe) id: number, @Query() query: Holy365DailyQuery, @Holy365OptionalUser() viewer: Holy365Signature | null) {
    await this.socialService.assertVisible(id, viewer?.id ?? null);
    return { days: await this.transcriptionUseCase.daily(id, query.days ?? 371) };
  }

  @Holy365Auth()
  @RestApiPost(OkResponse, { path: '/:id/follow', description: '팔로우' })
  async follow(@Param('id', ParseIntPipe) id: number, @Holy365User() viewer: Holy365Signature) {
    await this.socialService.follow(viewer.id, id);
  }

  @Holy365Auth()
  @RestApiDelete(OkResponse, { path: '/:id/follow', description: '팔로우 취소' })
  async unfollow(@Param('id', ParseIntPipe) id: number, @Holy365User() viewer: Holy365Signature) {
    await this.socialRepository.unfollow(viewer.id, id);
  }

  @Holy365Auth()
  @RestApiGet(Holy365SocialResponse, { path: '/me/blocks', description: '내가 차단한 사람' })
  async blocks(@Holy365User() viewer: Holy365Signature) {
    return { users: (await this.socialRepository.blocked(viewer.id)).map(u => ({ id: String(u.id), name: u.name, iconImageUrl: u.iconImageUrl })) };
  }

  @Holy365Auth()
  @RestApiPost(OkResponse, { path: '/:id/block', description: '차단 — 그 사람의 게시물·댓글이 보이지 않고 서로 팔로우가 끊긴다' })
  async block(@Param('id', ParseIntPipe) id: number, @Holy365User() viewer: Holy365Signature) {
    if (id !== viewer.id) await this.socialRepository.block(viewer.id, id);
  }

  @Holy365Auth()
  @RestApiDelete(OkResponse, { path: '/:id/block', description: '차단 해제' })
  async unblock(@Param('id', ParseIntPipe) id: number, @Holy365User() viewer: Holy365Signature) {
    await this.socialRepository.unblock(viewer.id, id);
  }

  @RestApiGet(Holy365SocialResponse, { path: '/:id/followers', description: '팔로워 목록' })
  async followers(@Param('id', ParseIntPipe) id: number, @Query() query: Holy365ListQuery) {
    return { users: (await this.socialRepository.followList(id, 'followers', query.limit ?? 50)).map(userCardOf) };
  }

  @RestApiGet(Holy365SocialResponse, { path: '/:id/following', description: '팔로잉 목록' })
  async following(@Param('id', ParseIntPipe) id: number, @Query() query: Holy365ListQuery) {
    return { users: (await this.socialRepository.followList(id, 'following', query.limit ?? 50)).map(userCardOf) };
  }
}

/** 친구 탭 — 추천 · 팔로우한 사람들의 활동 · 사람 찾기 */
@RestApiController('/holy365/social', 'Holy365 Social')
export class Holy365SocialController {
  constructor(
    private readonly socialService: Holy365SocialService,
    private readonly socialRepository: Holy365SocialRepository,
  ) {}

  @Holy365Auth()
  @RestApiGet(Holy365SocialResponse, { path: '/recommendations', description: '팔로우 추천 — 같은 교회 → 맞팔 → 이번 주 열심히 쓰는 사람' })
  async recommendations(@Holy365User() viewer: Holy365Signature, @Query() query: Holy365ListQuery) {
    return { users: await this.socialService.recommendations(viewer.id, query.limit ?? 10) };
  }

  @Holy365Auth()
  @RestApiGet(Holy365SocialResponse, { path: '/feed', description: '내가 팔로우한 사람들의 최근 필사' })
  async feed(@Holy365User() viewer: Holy365Signature, @Query() query: Holy365ListQuery) {
    return { users: await this.socialService.feed(viewer.id, query.limit ?? 30) };
  }

  @RestApiGet(Holy365SocialResponse, { path: '/users', description: '이름으로 사람 찾기' })
  async searchUsers(@Query() query: Holy365SearchQuery) {
    return { users: (await this.socialRepository.searchUsers(query.q.trim(), 20)).map(userCardOf) };
  }
}

/** 교회 — 검색(등록된 교회 + 카카오 지도) · 등록 · 교회 페이지 */
@RestApiController('/holy365/churches', 'Holy365 Church')
export class Holy365ChurchController {
  constructor(private readonly socialService: Holy365SocialService) {}

  @RestApiGet(Holy365SocialResponse, { path: '/search', description: '교회 검색 — 이미 등록된 교회 + 카카오 지도 교회' })
  search(@Query() query: Holy365SearchQuery) {
    return this.socialService.searchChurches(query.q);
  }

  @Holy365Auth()
  @RestApiPost(Holy365SocialResponse, { path: '', description: '교회 등록 (카카오 장소 또는 이름+지역) — 같은 교회가 있으면 그 교회를 돌려준다' })
  create(@Holy365User() viewer: Holy365Signature, @Body() request: Holy365CreateChurchRequest) {
    return this.socialService.createChurch(viewer.id, request);
  }

  @RestApiGet(Holy365SocialResponse, { path: '/:id', description: '교회 페이지 — 교인과 이번 달 필사' })
  page(@Param('id', ParseIntPipe) id: number) {
    return this.socialService.churchPage(id);
  }
}
