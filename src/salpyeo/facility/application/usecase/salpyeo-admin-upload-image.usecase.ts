import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { UploadFile } from '@/common/type/type';
import { SalpyeoFacilityImage } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { SalpyeoInvalidImage } from '@/salpyeo/facility/domain/exception/salpyeo-facility.exception';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXTENSION_BY_MIME: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/**
 * 관리자 시설 사진 업로드.
 *
 * 시설 사진은 공개 정보라 S3 에 public-read 로 올리고 평범한 공개 URL 을 그대로 저장한다
 * (온기 사진은 비공개라 presigned URL 을 쓰지만 여기는 그럴 이유가 없다).
 * 폭·높이는 화면이 레이아웃을 잡는 데 필요해서 업로드한 파일에서 직접 읽는다.
 *
 * 올린 사진은 관리자가 "저장"을 눌러야 시설에 반영된다 — 저장하지 않고 나가면 S3 에 파일만 남는다.
 */
@Injectable()
export class SalpyeoAdminUploadImageUseCase {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  async execute(slug: string, file: UploadFile): Promise<SalpyeoFacilityImage> {
    if (!file?.buffer?.length || !ALLOWED_MIME.has(file.mimetype)) throw new SalpyeoInvalidImage();

    const size = await this.readSize(file.buffer);
    const extension = EXTENSION_BY_MIME[file.mimetype];
    const path = ['salpyeo', 'facilities', slug, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`].join('/');

    const result = await this.awsS3Service.uploadStream(file.buffer, file.mimetype, path);
    if (!result) throw new SalpyeoInvalidImage();

    return { url: result.location, alt: '시설 사진', width: size.width, height: size.height };
  }

  private async readSize(buffer: Buffer): Promise<{ width: number; height: number }> {
    try {
      const { width, height } = await sharp(buffer).metadata();
      if (!width || !height) throw new SalpyeoInvalidImage();

      return { width, height };
    } catch {
      throw new SalpyeoInvalidImage();
    }
  }
}
