import { Body, Param, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost, RestApiDelete } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { Signature } from '@/common/decorator/Signature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { CreateResponse } from '@/common/response/createResponse';
import { AzeyoCreateJokboTemplateUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-create-jokbo-template.usecase';
import { AzeyoScanJokboTemplatesUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-scan-jokbo-templates.usecase';
import { AzeyoScanMyJokboTemplatesUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-scan-my-jokbo-templates.usecase';
import { AzeyoLikeJokboTemplateUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-like-jokbo-template.usecase';
import { AzeyoCopyJokboTemplateUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-copy-jokbo-template.usecase';
import { AzeyoDeleteJokboTemplateUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-delete-jokbo-template.usecase';
import { AzeyoCreateJokboTemplateRequest } from '@/azeyo/jokbo/presentation/dto/request/azeyo-create-jokbo-template.request';
import { AzeyoScanJokboTemplatesRequest } from '@/azeyo/jokbo/presentation/dto/request/azeyo-scan-jokbo-templates.request';
import { AzeyoJokboTemplatesResponse, AzeyoMyJokboTemplatesResponse } from '@/azeyo/jokbo/presentation/dto/response/azeyo-jokbo-template.response';

@RestApiController('/azeyo/jokbos', 'Azeyo Jokbo')
export class AzeyoJokboController {
  constructor(
    private readonly createTemplateUseCase: AzeyoCreateJokboTemplateUseCase,
    private readonly scanTemplatesUseCase: AzeyoScanJokboTemplatesUseCase,
    private readonly scanMyTemplatesUseCase: AzeyoScanMyJokboTemplatesUseCase,
    private readonly likeTemplateUseCase: AzeyoLikeJokboTemplateUseCase,
    private readonly copyTemplateUseCase: AzeyoCopyJokboTemplateUseCase,
    private readonly deleteTemplateUseCase: AzeyoDeleteJokboTemplateUseCase,
  ) {}

  @RestApiGet(AzeyoJokboTemplatesResponse, { path: '/', description: '족보 목록 조회' })
  async scanTemplates(@Signature() signature: UserSignature, @Query() request: AzeyoScanJokboTemplatesRequest) {
    const result = await this.scanTemplatesUseCase.execute({
      userId: signature?.id ?? null,
      page: request.page,
      size: request.size,
      category: request.category,
    });
    return new AzeyoJokboTemplatesResponse(result);
  }

  @RestApiGet(AzeyoMyJokboTemplatesResponse, { path: '/my', description: '내가 올린 족보 조회', auth: [USER_TYPE.CLIENT] })
  async scanMyTemplates(@AuthSignature() signature: UserSignature) {
    const templates = await this.scanMyTemplatesUseCase.execute(signature.id);
    return new AzeyoMyJokboTemplatesResponse(templates);
  }

  @RestApiPost(CreateResponse, { path: '/', description: '족보 등록', auth: [USER_TYPE.CLIENT] })
  async createTemplate(@AuthSignature() signature: UserSignature, @Body() request: AzeyoCreateJokboTemplateRequest) {
    const id = await this.createTemplateUseCase.execute(request.toCommand(signature.id));
    return new CreateResponse(id);
  }

  @RestApiPost(OkResponse, { path: '/:templateId/like', description: '족보 좋아요', auth: [USER_TYPE.CLIENT] })
  async likeTemplate(@AuthSignature() signature: UserSignature, @Param('templateId') templateId: number, @Body('isLike') isLike: boolean) {
    await this.likeTemplateUseCase.execute(signature.id, templateId, isLike);
    return new OkResponse();
  }

  @RestApiPost(OkResponse, { path: '/:templateId/copy', description: '족보 복사 카운트' })
  async copyTemplate(@Param('templateId') templateId: number) {
    await this.copyTemplateUseCase.execute(templateId);
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/:templateId', description: '족보 삭제', auth: [USER_TYPE.CLIENT] })
  async deleteTemplate(@AuthSignature() signature: UserSignature, @Param('templateId') templateId: number) {
    await this.deleteTemplateUseCase.execute(templateId, signature.id);
    return new OkResponse();
  }
}
