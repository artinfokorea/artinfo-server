import { Injectable } from '@nestjs/common';
import CoolsmsMessageService from 'coolsms-node-sdk';
import * as Sharp from 'sharp';
import { UploadImageIsNotValid } from '@/system/exception/system.exception';
import { Util } from '@/common/util/util';
import { UploadFile } from '@/common/type/type';
import { ImageRepository } from '@/system/repository/image.repository';
import { CreateImageCommand } from '@/system/dto/command/create-image.command';
import { ImageCreator } from '@/system/repository/operation/image.creator';

export type ImageMeta = {
  hash: string;
  filename: string;
  mimeType: string;
  extension: string;
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
};

@Injectable()
export class SystemService {
  private readonly messageService: CoolsmsMessageService;
  private readonly imageRepository: ImageRepository;

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

  async getUploadImageMetaOrThrow(uploadFile: UploadFile): Promise<ImageMeta> {
    const sharp = await (async (buffer: Buffer) => {
      try {
        return Sharp(buffer).metadata();
      } catch (e) {
        throw new UploadImageIsNotValid();
      }
    })(uploadFile.buffer);

    if (sharp.width == null || sharp.height == null || sharp.format == null || !['png', 'jpeg', 'jpg', 'webp'].includes(sharp.format)) {
      throw new UploadImageIsNotValid();
    }

    return {
      hash: new Util().generateRandomString(11),
      filename: Buffer.from(uploadFile.originalname, 'ascii').toString('utf8'),
      mimeType: `image/${sharp.format}`,
      extension: sharp.format,
      buffer: uploadFile.buffer,
      width: sharp.width,
      height: sharp.height,
      size: uploadFile.size,
    };
  }

  async getUploadImageMetasOrThrow(uploadFiles: UploadFile[]): Promise<ImageMeta[]> {
    const imageMetas: ImageMeta[] = [];
    for (const uploadFile of uploadFiles) {
      imageMetas.push(await this.getUploadImageMetaOrThrow(uploadFile));
    }
    return imageMetas;
  }

  createMany(commands: CreateImageCommand[]) {
    return this.imageRepository.createMany(commands.map(command => new ImageCreator(command)));
  }
}
