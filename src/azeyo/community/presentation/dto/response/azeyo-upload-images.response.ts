import { ApiProperty } from '@nestjs/swagger';

export class AzeyoUploadImagesResponse {
  @ApiProperty({ type: [String], description: '업로드된 이미지 URL 목록' })
  urls: string[];

  constructor(urls: string[]) {
    this.urls = urls;
  }
}
