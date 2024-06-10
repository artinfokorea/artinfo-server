import { ApiProperty } from '@nestjs/swagger';
import { UploadImageResponse } from '@/system/dto/response/upload-image.response';
import { Image } from '@/system/entity/image.entity';

export class UploadImagesResponse {
  @ApiProperty({ type: [UploadImageResponse], required: true, description: '이미지 아이디' })
  images!: UploadImageResponse[];

  constructor(images: Image[]) {
    this.images = images.map(image => new UploadImageResponse(image));
  }
}
