import { RedisService } from '@/common/redis/redis.service';
import { SystemService } from '@/system/service/system.service';
import { Util } from '@/common/util/util';
import { Injectable } from '@nestjs/common';
import { InvalidVerificationNumber } from '@/auth/exception/verification.expceition';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import { verificationEmailCodeTemplate } from '@/aws/ses/email-templates/verification-email-code.template';
import { UserRepository } from '@/user/repository/user.repository';

@Injectable()
export class VerificationService {
  constructor(
    private readonly redisService: RedisService,
    private readonly systemService: SystemService,
    private readonly awsSesService: AwsSesService,
    private readonly userRepository: UserRepository,
  ) {}

  async checkEmailExistence(email: string): Promise<boolean> {
    const user = await this.userRepository.findOneByEmail(email);

    return !!user;
  }

  async sendVerificationNumberMessage(to: string) {
    const verificationNumber = new Util().generateRandomNumbers();

    await this.systemService.sendVerificationNumber(to, verificationNumber);
    await this.redisService.setValue({
      key: to,
      value: verificationNumber,
      ttl: 300,
    });
  }

  async sendVerificationNumberEmail(to: string) {
    const title = '아트인포 - 이메일 인증';
    const verificationNumber = new Util().generateRandomNumbers();

    await this.awsSesService.send(to, title, verificationEmailCodeTemplate(verificationNumber));
    await this.redisService.setValue({
      key: to,
      value: verificationNumber,
      ttl: 300,
    });
  }

  async verifyMobile(phone: string, verification: string) {
    const verificationNumber = await this.redisService.getByKey(phone);
    if (verificationNumber !== verification) throw new InvalidVerificationNumber();

    await this.redisService.setValue({
      key: phone,
      value: true,
      ttl: 300,
    });
  }

  async verifyEmail(email: string, verification: string) {
    const verificationNumber = await this.redisService.getByKey(email);
    if (verificationNumber !== verification) throw new InvalidVerificationNumber();

    await this.redisService.setValue({
      key: email,
      value: true,
      ttl: 300,
    });
  }
}
