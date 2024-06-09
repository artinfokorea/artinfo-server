import { Injectable } from '@nestjs/common';
import CoolsmsMessageService from 'coolsms-node-sdk';

@Injectable()
export class SystemService {
  private readonly messageService: CoolsmsMessageService;

  constructor() {
    this.messageService = new CoolsmsMessageService(process.env['COOL_SMS_API_KEY']!, process.env['COOL_SMS_SECRET_KEY']!);
  }

  async sendVerificationNumber(to: string, verificationNumber: string) {
    await this.messageService.sendOne({
      from: '01040287451',
      to: to,
      text: `[아트인포] 인증 번호: ${verificationNumber}`,
      autoTypeDetect: true,
    });
  }
}
