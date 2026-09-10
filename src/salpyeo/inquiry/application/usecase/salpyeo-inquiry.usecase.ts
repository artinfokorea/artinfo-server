import { Inject, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { UploadFile } from '@/common/type/type';
import { SalpyeoInquiry } from '@/salpyeo/inquiry/domain/entity/salpyeo-inquiry.entity';
import { ISalpyeoInquiryRepository, SALPYEO_INQUIRY_REPOSITORY } from '@/salpyeo/inquiry/domain/repository/salpyeo-inquiry.repository.interface';
import { SalpyeoInquiryInvalidImage } from '@/salpyeo/inquiry/domain/exception/salpyeo-inquiry.exception';

const EXTENSION_BY_MIME: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/** 관리자 목록에서 한 번에 보여 줄 최대 건수 */
export const SALPYEO_INQUIRY_SCAN_LIMIT = 200;

export interface SalpyeoCreateInquiryCommand {
  title: string;
  content: string;
  email: string;
  files: UploadFile[];
}

/**
 * 문의 접수 — **비로그인 공개 API**.
 *
 * 누구나 부를 수 있으므로 첨부는 한 요청에 함께 받아 서버가 검증한 뒤 올린다
 * (따로 공개 업로드 엔드포인트를 두면 아무나 S3 에 파일을 쌓을 수 있다).
 * 첨부는 실제 바이트로 형식을 확인하며, 하나라도 이미지가 아니면 아무것도 저장하지 않고 거절한다.
 */
@Injectable()
export class SalpyeoCreateInquiryUseCase {
  constructor(
    @Inject(SALPYEO_INQUIRY_REPOSITORY)
    private readonly inquiryRepository: ISalpyeoInquiryRepository,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  async execute(command: SalpyeoCreateInquiryCommand): Promise<SalpyeoInquiry> {
    const images: string[] = [];

    for (const file of command.files) {
      const mimetype = await this.detectImageMime(file);
      // 문의는 오래 보관하지 않으므로 접수 월별로 묶어 나중에 정리하기 쉽게 한다
      const month = new Date().toISOString().slice(0, 7);
      const path = ['salpyeo', 'inquiries', month, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXTENSION_BY_MIME[mimetype]}`].join('/');

      const uploaded = await this.awsS3Service.uploadStream(file.buffer, mimetype, path);
      if (!uploaded) throw new SalpyeoInquiryInvalidImage();

      images.push(uploaded.location);
    }

    return this.inquiryRepository.create({
      title: command.title,
      content: command.content,
      email: command.email,
      images,
    });
  }

  /** Content-Type 은 클라이언트가 마음대로 보낼 수 있어 실제 바이트로 확인한다 */
  private async detectImageMime(file: UploadFile): Promise<string> {
    if (!file?.buffer?.length) throw new SalpyeoInquiryInvalidImage();

    try {
      const { format } = await sharp(file.buffer).metadata();
      const mimetype = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : format === 'jpeg' ? 'image/jpeg' : '';
      if (!EXTENSION_BY_MIME[mimetype]) throw new SalpyeoInquiryInvalidImage();

      return mimetype;
    } catch {
      throw new SalpyeoInquiryInvalidImage();
    }
  }
}

@Injectable()
export class SalpyeoScanInquiriesUseCase {
  constructor(
    @Inject(SALPYEO_INQUIRY_REPOSITORY)
    private readonly inquiryRepository: ISalpyeoInquiryRepository,
  ) {}

  async execute(): Promise<SalpyeoInquiry[]> {
    return this.inquiryRepository.scan(SALPYEO_INQUIRY_SCAN_LIMIT);
  }
}

@Injectable()
export class SalpyeoResolveInquiryUseCase {
  constructor(
    @Inject(SALPYEO_INQUIRY_REPOSITORY)
    private readonly inquiryRepository: ISalpyeoInquiryRepository,
  ) {}

  async execute(id: number, isResolved: boolean): Promise<SalpyeoInquiry> {
    return this.inquiryRepository.setResolved(id, isResolved);
  }
}
