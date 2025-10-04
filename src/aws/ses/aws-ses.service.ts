import { Injectable } from '@nestjs/common';
import { SES, SendRawEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class AwsSesService {
  private readonly ses: SES;

  constructor() {
    this.ses = new SES({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async send(to: string | string[], subject: string, html: string): Promise<void> {
    const recipients = Array.isArray(to) ? to.join(',') : to;

    const rawEmail = [
      `From: ARTINFO <artinfokorea2022@gmail.com>`,
      `To: ${recipients}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      '',
      html,
    ].join('\r\n');

    const command = new SendRawEmailCommand({
      RawMessage: { Data: Buffer.from(rawEmail) },
    });

    await this.ses.send(command);
  }
}
