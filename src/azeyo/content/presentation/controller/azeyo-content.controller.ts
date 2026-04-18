import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { AzeyoScanContentTestsUseCase } from '@/azeyo/content/application/usecase/azeyo-scan-content-tests.usecase';
import { AzeyoContentTestsResponse } from '@/azeyo/content/presentation/dto/response/azeyo-content-test.response';

@RestApiController('/azeyo/contents', 'Azeyo Content')
export class AzeyoContentController {
  constructor(
    private readonly scanTestsUseCase: AzeyoScanContentTestsUseCase,
  ) {}

  @RestApiGet(AzeyoContentTestsResponse, { path: '/tests', description: '테스트 콘텐츠 목록 조회' })
  async scanTests() {
    const tests = await this.scanTestsUseCase.execute();
    return new AzeyoContentTestsResponse(tests);
  }
}
