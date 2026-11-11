import { Body, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OptionalJwtAuthGuard } from '@/common/security/optional-jwt-auth.guard';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { OkResponse } from '@/common/response/ok.response';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { CompetitionNotAllowed } from './competition.exception';
import { CompetitionService } from './competition.service';
import { ContestCompetitionCrawler } from './crawler/contest-competition.crawler';
import { CompetitionCrawlResponse } from './dto/competition.response';
import { CompetitionWriteRequest, CrawlCompetitionsRequest, GetCompetitionsRequest } from './dto/competition.request';
import { CompetitionResponse, CompetitionsResponse, CreateCompetitionResponse } from './dto/competition.response';

/** 콩쿠르 공고 — 목록·상세는 공개, 등록·수정·삭제는 회원(본인 또는 관리자), 승인은 관리자 */
@RestApiController('/competitions', 'Competition')
export class CompetitionController {
  constructor(
    private readonly service: CompetitionService,
    private readonly crawler: ContestCompetitionCrawler,
  ) {}

  @RestApiGet(CompetitionsResponse, { path: '/', description: '콩쿠르 목록 — 게시된 공고만, 마감임박순. phases 비우면 종료 제외' })
  async list(@Query() request: GetCompetitionsRequest): Promise<CompetitionsResponse> {
    const { items, totalCount } = await this.service.findPage(request.toFilter());
    return new CompetitionsResponse(items, totalCount);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @RestApiPost(CompetitionCrawlResponse, {
    path: '/crawl',
    description: '[관리자] contest.co.kr 콩쿠르 수집을 지금 실행 — ?limit=N(1~200) 이면 목록 앞 N건만, 비우면 50건 (스케줄과 같음)',
    auth: [USER_TYPE.ADMIN],
  })
  async crawl(@AuthSignature() signature: UserSignature, @Query() request: CrawlCompetitionsRequest): Promise<CompetitionCrawlResponse> {
    if (!(await this.service.isAdmin(signature.id))) throw new CompetitionNotAllowed();
    return new CompetitionCrawlResponse(await this.crawler.crawl({ limit: request.limit }));
  }

  @RestApiGet(CompetitionResponse, { path: '/:id', description: '콩쿠르 상세 — 검토 중 공고는 등록자·관리자만 (Bearer 토큰이 있으면 본인 확인)' })
  async detail(@Param('id', ParseIntPipe) id: number, @Req() req: Request & { user?: UserSignature | null }): Promise<CompetitionResponse> {
    return new CompetitionResponse(await this.service.findOne(id, req.user?.id ?? null));
  }

  @RestApiPost(CreateCompetitionResponse, { path: '/', description: '콩쿠르 등록 — 회원은 검토 후 게시, 관리자는 즉시 게시', auth: [USER_TYPE.CLIENT] })
  async create(@AuthSignature() signature: UserSignature, @Body() request: CompetitionWriteRequest): Promise<CreateCompetitionResponse> {
    return new CreateCompetitionResponse(await this.service.create(signature.id, request.toWrite()));
  }

  @RestApiPut(OkResponse, { path: '/:id', description: '콩쿠르 수정 — 등록자 본인 또는 관리자', auth: [USER_TYPE.CLIENT] })
  async update(
    @AuthSignature() signature: UserSignature,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: CompetitionWriteRequest,
  ): Promise<OkResponse> {
    await this.service.update(id, signature.id, request.toWrite());
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/:id', description: '콩쿠르 삭제 — 등록자 본인 또는 관리자', auth: [USER_TYPE.CLIENT] })
  async remove(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number): Promise<OkResponse> {
    await this.service.remove(id, signature.id);
    return new OkResponse();
  }

  @RestApiPost(OkResponse, { path: '/:id/publish', description: '[관리자] 검토 중 공고 게시', auth: [USER_TYPE.ADMIN] })
  async publish(@AuthSignature() signature: UserSignature, @Param('id', ParseIntPipe) id: number): Promise<OkResponse> {
    await this.service.publish(id, signature.id);
    return new OkResponse();
  }
}
