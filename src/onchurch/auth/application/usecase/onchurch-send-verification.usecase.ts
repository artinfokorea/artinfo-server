import { Injectable } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { SystemService } from '@/system/service/system.service';

@Injectable()
export class OnchurchSendVerificationUseCase {
  private readonly CODE_TTL_SECONDS = 300; // 5 minutes

  constructor(
    private readonly redisRepository: RedisRepository,
    private readonly systemService: SystemService,
  ) {}

  async execute(phone: string): Promise<void> {
    const code = this.generateCode();

    await this.redisRepository.setValue({
      key: this.codeKey(phone),
      value: code,
      ttl: this.CODE_TTL_SECONDS,
    });

    await this.systemService.sendVerificationNumber(phone, code);
  }

  private codeKey(phone: string): string {
    return `onchurch:verification:${phone}`;
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
