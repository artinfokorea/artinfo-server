import { Injectable } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { OnchurchInvalidVerificationCode } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';

@Injectable()
export class OnchurchVerifyCodeUseCase {
  private readonly VERIFIED_TTL_SECONDS = 600; // 10 minutes — 가입 진행 시간 여유

  constructor(private readonly redisRepository: RedisRepository) {}

  async execute(phone: string, code: string): Promise<void> {
    const cachedCode = await this.redisRepository.getByKey(this.codeKey(phone));
    if (!cachedCode || String(cachedCode) !== code) {
      throw new OnchurchInvalidVerificationCode();
    }

    await this.redisRepository.setValue({
      key: this.verifiedKey(phone),
      value: true,
      ttl: this.VERIFIED_TTL_SECONDS,
    });
    await this.redisRepository.delete(this.codeKey(phone));
  }

  private codeKey(phone: string): string {
    return `onchurch:verification:${phone}`;
  }

  private verifiedKey(phone: string): string {
    return `onchurch:verified:${phone}`;
  }
}
