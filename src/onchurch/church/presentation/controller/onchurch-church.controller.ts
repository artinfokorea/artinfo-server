import { Body, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OnchurchScanMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-scan-my-church.usecase';
import { OnchurchUpsertMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-upsert-my-church.usecase';
import { OnchurchPublishMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-publish-my-church.usecase';
import { OnchurchCheckSlugUseCase } from '@/onchurch/church/application/usecase/onchurch-check-slug.usecase';
import { OnchurchUpdateMySiteTemplateUseCase } from '@/onchurch/church/application/usecase/onchurch-update-my-site-template.usecase';
import { OnchurchApplyReferralCodeUseCase, OnchurchGetMyReferralUseCase } from '@/onchurch/church/application/usecase/onchurch-referral.usecase';
import { OnchurchUpsertMyChurchRequest } from '@/onchurch/church/presentation/dto/request/onchurch-upsert-my-church.request';
import { OnchurchPublishMyChurchRequest } from '@/onchurch/church/presentation/dto/request/onchurch-publish-my-church.request';
import { OnchurchUpdateMySiteTemplateRequest } from '@/onchurch/church/presentation/dto/request/onchurch-update-my-site-template.request';
import { OnchurchApplyReferralCodeRequest } from '@/onchurch/church/presentation/dto/request/onchurch-apply-referral-code.request';
import { OnchurchChurchResponse, OnchurchMyChurchResponse } from '@/onchurch/church/presentation/dto/response/onchurch-church.response';
import { OnchurchCheckSlugResponse } from '@/onchurch/church/presentation/dto/response/onchurch-check-slug.response';
import { OnchurchMyReferralResponse } from '@/onchurch/church/presentation/dto/response/onchurch-referral.response';

@RestApiController('/onchurch/churches', 'Onchurch Church')
export class OnchurchChurchController {
  constructor(
    private readonly scanMyChurchUseCase: OnchurchScanMyChurchUseCase,
    private readonly upsertMyChurchUseCase: OnchurchUpsertMyChurchUseCase,
    private readonly publishMyChurchUseCase: OnchurchPublishMyChurchUseCase,
    private readonly checkSlugUseCase: OnchurchCheckSlugUseCase,
    private readonly updateMySiteTemplateUseCase: OnchurchUpdateMySiteTemplateUseCase,
    private readonly getMyReferralUseCase: OnchurchGetMyReferralUseCase,
    private readonly applyReferralCodeUseCase: OnchurchApplyReferralCodeUseCase,
  ) {}

  @RestApiGet(OnchurchCheckSlugResponse, { path: '/check-slug', description: '서브도메인 사용 가능 여부 확인 (본인이 이미 점유 중인 경우 사용 가능 처리)', auth: [USER_TYPE.CLIENT] })
  async checkSlug(@AuthSignature() signature: UserSignature, @Query('slug') slug: string) {
    const available = await this.checkSlugUseCase.execute(signature.id, (slug ?? '').trim());
    return new OnchurchCheckSlugResponse(available);
  }

  @RestApiGet(OnchurchMyChurchResponse, { path: '/me', description: '내 교회 정보 + 구독 상태 조회', auth: [USER_TYPE.CLIENT] })
  async scanMyChurch(@AuthSignature() signature: UserSignature) {
    const { church, user, churchRole } = await this.scanMyChurchUseCase.execute(signature.id);
    return new OnchurchMyChurchResponse(church, user, churchRole);
  }

  @RestApiPut(OnchurchChurchResponse, { path: '/me', description: '내 교회 정보 생성/수정', auth: [USER_TYPE.CLIENT] })
  async upsertMyChurch(@AuthSignature() signature: UserSignature, @Body() request: OnchurchUpsertMyChurchRequest) {
    const church = await this.upsertMyChurchUseCase.execute(signature.id, request.toCommand());
    return new OnchurchChurchResponse(church);
  }

  @RestApiPut(OnchurchChurchResponse, { path: '/me/site-template', description: '내 교회 공개 홈페이지 템플릿 변경', auth: [USER_TYPE.CLIENT] })
  async updateMySiteTemplate(@AuthSignature() signature: UserSignature, @Body() request: OnchurchUpdateMySiteTemplateRequest) {
    const church = await this.updateMySiteTemplateUseCase.execute(signature.id, request.siteTemplate ?? null);
    return new OnchurchChurchResponse(church);
  }

  @RestApiGet(OnchurchMyReferralResponse, { path: '/me/referral', description: '내 교회 추천 코드 + 추천 현황 조회 (코드가 없으면 이 시점에 발급)', auth: [USER_TYPE.CLIENT] })
  async getMyReferral(@AuthSignature() signature: UserSignature) {
    const referral = await this.getMyReferralUseCase.execute(signature.id);
    return new OnchurchMyReferralResponse(referral);
  }

  @RestApiPut(OnchurchMyReferralResponse, { path: '/me/referral', description: '다른 교회의 추천인 코드 입력 (1회, 첫 결제 확인 전까지)', auth: [USER_TYPE.CLIENT] })
  async applyReferralCode(@AuthSignature() signature: UserSignature, @Body() request: OnchurchApplyReferralCodeRequest) {
    await this.applyReferralCodeUseCase.execute(signature.id, request.code);
    return new OnchurchMyReferralResponse(await this.getMyReferralUseCase.execute(signature.id));
  }

  @RestApiPut(OnchurchMyChurchResponse, { path: '/me/publish', description: '사이트 운영 on/off (필수항목 + 구독 검증, 첫 publish 시 7일 무료 체험 자동 부여)', auth: [USER_TYPE.CLIENT] })
  async publishMyChurch(@AuthSignature() signature: UserSignature, @Body() request: OnchurchPublishMyChurchRequest) {
    const { church, user } = await this.publishMyChurchUseCase.execute(signature.id, request.isPublished);
    return new OnchurchMyChurchResponse(church, user);
  }
}
