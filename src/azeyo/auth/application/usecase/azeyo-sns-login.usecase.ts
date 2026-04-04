import { Injectable } from '@nestjs/common';
import { AZEYO_SNS_TYPE } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { AzeyoMaleOnlyService } from '@/azeyo/auth/domain/exception/azeyo-auth.exception';

@Injectable()
export class AzeyoSnsLoginUseCase {
  // 남성만 가입/로그인 가능 (테스트: 모든 유저 차단)
  async execute(_token: string, _type: AZEYO_SNS_TYPE): Promise<never> {
    throw new AzeyoMaleOnlyService();
  }
}
