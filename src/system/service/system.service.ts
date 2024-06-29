import { Injectable } from '@nestjs/common';
import CoolsmsMessageService from 'coolsms-node-sdk';
import * as Sharp from 'sharp';
import { UploadImageIsNotValid } from '@/system/exception/system.exception';
import { Util } from '@/common/util/util';
import { UploadFile } from '@/common/type/type';
import { ImageRepository } from '@/system/repository/image.repository';
import { CreateImagesCommand } from '@/system/dto/command/create-images.command';
import { ImageCreator } from '@/system/repository/operation/image.creator';
import { Image } from '@/system/entity/image.entity';
import * as moment from 'moment/moment';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import * as convert from 'heic-convert';

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

  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly imageRepository: ImageRepository,
  ) {
    this.messageService = new CoolsmsMessageService(process.env['COOL_SMS_API_KEY']!, process.env['COOL_SMS_SECRET_KEY']!);
  }

  async sendVerificationNumber(to: string, verificationNumber: string) {
    await this.messageService.sendOne({
      from: process.env['COOL_SMS_SENDER_NUMBER']!,
      to: to,
      text: `[아트인포] 인증 번호: ${verificationNumber}`,
      autoTypeDetect: true,
    });
  }

  async getUploadImageMetaOrThrow(uploadFile: UploadFile): Promise<ImageMeta> {
    let imageBuffer: Buffer;

    const imageMetadata = await Sharp(uploadFile.buffer).metadata();

    try {
      if (imageMetadata.format === 'heif') {
        const jpegFormatedArrayBuffer = await convert({
          buffer: uploadFile.buffer,
          format: 'JPEG',
        });

        imageBuffer = await Sharp(jpegFormatedArrayBuffer).toBuffer();
      } else {
        imageBuffer = uploadFile.buffer;
      }
    } catch (e) {
      throw new UploadImageIsNotValid();
    }

    const resizedBuffer = await Sharp(imageBuffer).resize(540, null, { withoutEnlargement: true }).jpeg({ quality: 80 }).withMetadata().toBuffer();
    const resizedMetaData = await Sharp(resizedBuffer).rotate().metadata();

    if (
      !resizedMetaData.width ||
      !resizedMetaData.height ||
      !resizedMetaData.format ||
      !resizedMetaData.size ||
      !['png', 'jpeg', 'jpg', 'webp', 'heif'].includes(resizedMetaData.format)
    ) {
      throw new UploadImageIsNotValid();
    }

    return {
      hash: new Util().generateRandomString(11),
      filename: Buffer.from(uploadFile.originalname, 'ascii').toString('utf8'),
      mimeType: `image/${resizedMetaData.format}`,
      extension: resizedMetaData.format,
      buffer: resizedBuffer,
      width: resizedMetaData.width,
      height: resizedMetaData.height,
      size: resizedMetaData.size,
    };
  }

  async getUploadImageMetasOrThrow(uploadFiles: UploadFile[]): Promise<ImageMeta[]> {
    const imageMetas: ImageMeta[] = [];
    for (const uploadFile of uploadFiles) {
      imageMetas.push(await this.getUploadImageMetaOrThrow(uploadFile));
    }
    return imageMetas;
  }

  async createImageMany(command: CreateImagesCommand): Promise<Image[]> {
    const imageMetas = await this.getUploadImageMetasOrThrow(command.files);

    const imageCreators = await Promise.all(
      imageMetas.map(async imageMeta => {
        const groupPath = ['upload', command.userId, 'images', moment().format('YYYYMMDD')].join('/');
        const filename = imageMeta.hash + '.' + Date.now() + '.' + imageMeta.extension;
        const path = [groupPath, 'original', filename].join('/');

        const result = await this.awsS3Service.uploadStream(imageMeta.buffer, imageMeta.mimeType, path);
        if (result == null) {
          throw new UploadImageIsNotValid();
        }

        return new ImageCreator({
          userId: command.userId,
          target: command.target,
          originalFilename: imageMeta.filename,
          groupPath: groupPath,
          savedFilename: filename,
          savedPath: result.key,
          mimeType: imageMeta.mimeType,
          width: imageMeta.width,
          height: imageMeta.height,
          size: imageMeta.size,
        });
      }),
    );

    const imageIds = await this.imageRepository.createMany(imageCreators);

    return this.imageRepository.findManyByIds(imageIds);
  }
}
