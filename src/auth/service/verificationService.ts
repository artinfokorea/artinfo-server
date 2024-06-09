import { RedisService } from '@/common/redis/redis.service';
import { SystemService } from '@/system/service/system.service';
import { Util } from '@/common/util/util';
import { Injectable } from '@nestjs/common';
import { InvalidVerificationNumber } from '@/auth/exception/verification.expceition';

@Injectable()
export class VerificationService {
  constructor(
    private readonly redisService: RedisService,
    private readonly systemService: SystemService,
  ) {}

  async sendVerificationNumberMessage(to: string) {
    const verificationNumber = new Util().generateRandomNumbers();

    await this.systemService.sendVerificationNumber(to, verificationNumber);
    await this.redisService.setValue({
      key: to,
      value: verificationNumber,
      ttl: 300,
    });
  }

  async verifyMobile(phone: string, verification: string) {
    const verificationNumber = await this.redisService.getByKey(phone);
    console.log(verificationNumber);
    if (verificationNumber !== verification) throw new InvalidVerificationNumber();

    await this.redisService.setValue({
      key: phone,
      value: true,
      ttl: 300,
    });
  }
}
