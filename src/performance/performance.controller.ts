import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { PerformanceService } from '@/performance/performance.service';

@RestApiController('/performances', 'Performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @RestApiGet(OkResponse, { path: '/temp', description: '임시' })
  async temp() {
    await this.performanceService.temp();
    return new OkResponse();
  }
}
