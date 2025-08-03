import { Injectable } from '@nestjs/common';
import CoolsmsMessageService from 'coolsms-node-sdk';
import * as Sharp from 'sharp';
import { UploadImageIsNotValid } from '@/system/exception/system.exception';
import { Util } from '@/common/util/util';
import { UploadFile } from '@/common/type/type';
import { ImageRepository } from '@/system/repository/image.repository';
import { CreateImagesCommand } from '@/system/dto/command/create-images.command';
import { ImageCreator } from '@/system/repository/operation/image.creator';
import { ImageEntity } from '@/system/entity/image.entity';
import * as moment from 'moment/moment';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { RedisRepository } from '@/common/redis/redis-repository.service';

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
    private readonly redisRepository: RedisRepository,
  ) {
    this.messageService = new CoolsmsMessageService(process.env['COOL_SMS_API_KEY']!, process.env['COOL_SMS_SECRET_KEY']!);
  }

  async sendApplyJobAlarmSMS(to: string) {
    await this.messageService.sendOne({
      from: process.env['COOL_SMS_SENDER_NUMBER']!,
      to: to,
      subject: '[ 아트인포 ]',
      text: `채용 신청이 도착했어요\n신청내역을 확인해주세요.
      내 프로필  >  내 활동\n\nhttps://artinfokorea.com\n\n아트인포 드림
      `,
      autoTypeDetect: true,
    });
  }

  async sendSMS(to: string, text: string) {
    console.log(process.env['COOL_SMS_SENDER_NUMBER']);
    await this.messageService.sendOne({
      from: process.env['COOL_SMS_SENDER_NUMBER']!,
      to: to,
      subject: '[ 아트인포 - 레슨 신청 ]',
      text: text,
      autoTypeDetect: true,
    });
  }

  async sendVerificationNumber(to: string, verificationNumber: string) {
    await this.messageService.sendOne({
      from: process.env['COOL_SMS_SENDER_NUMBER']!,
      to: to,
      text: `[아트인포] 인증 번호: ${verificationNumber}`,
      autoTypeDetect: true,
    });
  }

  async getUploadImageMetaOrThrow(uploadFile: UploadFile, compress: boolean): Promise<ImageMeta> {
    let imageBuffer: Buffer;

    let imageMetadata = await Sharp(uploadFile.buffer).metadata();

    try {
      imageBuffer = uploadFile.buffer;
    } catch (e) {
      throw new UploadImageIsNotValid();
    }

    if (compress) {
      imageBuffer = await Sharp(imageBuffer).resize(540, null, { withoutEnlargement: true }).jpeg({ quality: 80 }).withMetadata().toBuffer();
      imageMetadata = await Sharp(imageBuffer).rotate().metadata();
    }

    if (
      !imageMetadata.width ||
      !imageMetadata.height ||
      !imageMetadata.format ||
      !imageMetadata.size ||
      !['png', 'jpeg', 'jpg', 'webp', 'heif', 'gif'].includes(imageMetadata.format)
    ) {
      throw new UploadImageIsNotValid();
    }

    return {
      hash: new Util().generateRandomString(11),
      filename: Buffer.from(uploadFile.originalname, 'ascii').toString('utf8'),
      mimeType: `image/${imageMetadata.format}`,
      extension: imageMetadata.format,
      buffer: imageBuffer,
      width: imageMetadata.width,
      height: imageMetadata.height,
      size: imageMetadata.size,
    };
  }

  async getUploadImageMetasOrThrow(uploadFiles: UploadFile[], compress: boolean): Promise<ImageMeta[]> {
    const imageMetas: ImageMeta[] = [];
    for (const uploadFile of uploadFiles) {
      imageMetas.push(await this.getUploadImageMetaOrThrow(uploadFile, compress));
    }
    return imageMetas;
  }

  async createImageMany(command: CreateImagesCommand): Promise<ImageEntity[]> {
    const imageMetas = await this.getUploadImageMetasOrThrow(command.files, command.compress);

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

  async deleteCaching() {
    await this.redisRepository.deleteAll();
  }
}
