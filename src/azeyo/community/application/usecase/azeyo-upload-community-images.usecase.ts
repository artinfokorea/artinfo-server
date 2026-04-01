import { Injectable } from '@nestjs/common';
import { AzeyoS3Service } from '@/azeyo/common/azeyo-s3.service';
import { UploadFile } from '@/common/type/type';
import * as moment from 'moment';

@Injectable()
export class AzeyoUploadCommunityImagesUseCase {
  constructor(private readonly azeyoS3Service: AzeyoS3Service) {}

  async execute(userId: number, files: UploadFile[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const datePath = moment().format('YYYYMMDD');
      const ext = file.mimetype.split('/')[1] ?? 'jpeg';
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const uploadPath = `upload/azeyo/${userId}/community/${datePath}/${filename}`;
      const result = await this.azeyoS3Service.uploadStream(file.buffer, file.mimetype, uploadPath);
      if (result) urls.push(result.location);
    }
    return urls;
  }
}
