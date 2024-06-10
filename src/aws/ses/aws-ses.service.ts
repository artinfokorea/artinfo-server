import { Injectable } from '@nestjs/common';
import { SES, SendRawEmailCommand } from '@aws-sdk/client-ses';
import * as nodemailer from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

@Injectable()
export class AwsSesService {
  private readonly mailer: Mail;

  constructor() {
    console.log(process.env['AWS_ACCESS_KEY'], process.env['AWS_SECRET_ACCESS_KEY']);
    const ses = new SES({
      region: process.env['AWS_REGION'],
      credentials: {
        accessKeyId: process.env['AWS_ACCESS_KEY']!,
        secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY']!,
      },
    });
    this.mailer = nodemailer.createTransport({
      SES: { ses, aws: { SendRawEmailCommand } },
    });
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      const params: Mail.Options = {
        from: {
          name: 'ARTINFO',
          address: 'artinfokorea2022@gmail.com',
        },
        to: to,
        subject: subject,
        html: html,
      };

      return await this.mailer.sendMail(params);
    } catch (error) {
      throw error;
    }
  }
}
