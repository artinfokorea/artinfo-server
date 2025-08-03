import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { PerformanceService } from '@/performance/performance.service';
import { PerformancesResponse } from '@/performance/dto/response/performances.response';
import { Body, Param, Query } from '@nestjs/common';
import { GetPerformancesRequest } from '@/performance/dto/request/get-performances.request';
import { PerformanceDetailResponse } from '@/performance/dto/response/performance-detail.response';
import { OkResponse } from '@/common/response/ok.response';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { CreateResponse } from '@/common/response/createResponse';
import { CreatePerformanceRequest } from '@/performance/dto/request/create-performance.request';
import { EditPerformanceRequest } from '@/performance/dto/request/edit-performance.request';
import { PerformanceAreasResponse } from '@/performance/dto/response/performance-areas.response';
import { PerformanceAreaService } from '@/performance/performance-area.service';
import { GetPerformanceAreasRequest } from '@/performance/dto/request/get-performance-areas.request';
import { CountPerformancesResponse } from '@/performance/dto/response/count-performances.response';

@RestApiController('/performances', 'Performance')
export class PerformanceController {
  constructor(
    private readonly performanceService: PerformanceService,
    private readonly performanceAreaService: PerformanceAreaService,
  ) {}

  @RestApiPost(CreatePerformanceRequest, { path: '/', description: '공연 생성', auth: [USER_TYPE.CLIENT] })
  async createPerformance(@AuthSignature() signature: UserSignature, @Body() request: CreatePerformanceRequest) {
    const performanceId = await this.performanceService.createPerformance(request.toCommand(signature.id));
    return new CreateResponse(performanceId);
  }

  @RestApiPut(OkResponse, { path: '/:performanceId', description: '공연 수정', auth: [USER_TYPE.CLIENT] })
  async editPerformance(@AuthSignature() signature: UserSignature, @Param('performanceId') performanceId: number, @Body() request: EditPerformanceRequest) {
    await this.performanceService.editPerformance(request.toCommand(signature.id, performanceId));
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/:performanceId', description: '공연 삭제', auth: [USER_TYPE.CLIENT] })
  async deletePerformance(@AuthSignature() signature: UserSignature, @Param('performanceId') performanceId: number) {
    await this.performanceService.deletePerformance(signature.id, performanceId);
    return new OkResponse();
  }

  @RestApiGet(PerformanceAreasResponse, { path: '/areas', description: '공연장 목록 조회' })
  async getPerformanceAreas(@Query() request: GetPerformanceAreasRequest) {
    const { items, totalCount } = await this.performanceAreaService.getPagingPerformanceAreas(request.toQuery());
    return new PerformanceAreasResponse({ performanceAreas: items, totalCount: totalCount });
  }

  @RestApiGet(PerformancesResponse, { path: '/', description: '공연 목록 조회' })
  async getPerformances(@Query() request: GetPerformancesRequest) {
    const { items, totalCount } = await this.performanceService.getPagingPerformances(request.toQuery());
    return new PerformancesResponse({ performances: items, totalCount: totalCount });
  }

  @RestApiGet(CountPerformancesResponse, { path: '/count', description: '예정된 공연 개수 조회' })
  async countPreArrangedPerformances() {
    const totalCount = await this.performanceService.countPreArrangedPerformance();
    return new CountPerformancesResponse(totalCount);
  }

  @RestApiGet(OkResponse, { path: '/test', description: '테스트' })
  async test() {
    await this.performanceService.scrapPerformances();
    return new OkResponse();
  }

  @RestApiGet(PerformanceDetailResponse, { path: '/:performanceId', description: '공연 단건 조회' })
  async getPerformance(@Param('performanceId') performanceId: number) {
    const performance = await this.performanceService.getPerformance(performanceId);
    return new PerformanceDetailResponse(performance);
  }
}
