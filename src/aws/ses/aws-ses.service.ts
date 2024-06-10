// import { Injectable } from '@nestjs/common';
// import { SES, SendRawEmailCommand } from '@aws-sdk/client-ses';
// import * as nodemailer from 'nodemailer';
// import * as Mail from 'nodemailer/lib/mailer';
//
// @Injectable()
// export class AwsSesService {
//   private readonly mailer: Mail;
//
//   constructor() {
//     const ses = new SES({
//       region: process.env['AWS_SES_REGION'],
//       credentials: {
//         accessKeyId: process.env['AWS_SES_ACCESS_KEY']!,
//         secretAccessKey: process.env['AWS_SES_SECRET_KEY']!,
//       },
//     });
//     this.mailer = nodemailer.createTransport({
//       SES: { ses, aws: { SendRawEmailCommand } },
//     });
//   }
//
//   async send(
//     // from: string,
//     to: string,
//     subject: string,
//     html: string,
//     // attachments: Mail.Attachment[] = [],
//   ): Promise<void> {
//     try {
//
//       const params: Mail.Options = {
//         from: {
//           name: 'SmileTap',
//           address: 'daniel@e-connect.kr',
//         },
//         to: to,
//         subject: subject,
//         html: html,
//       };
//
//       return await this.mailer.sendMail(params);
//     } catch (error) {
//       throw error;
//     }
//   }
// }
