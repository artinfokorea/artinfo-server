import { ApiProperty } from '@nestjs/swagger';
import { IMAGE_TARGET } from '@/system/entity/image.entity';

export class UploadImagesRequest {
  @ApiProperty({ enum: IMAGE_TARGET, enumName: 'IMAGE_TARGET', required: true, description: '업로드 대상', example: IMAGE_TARGET.USER })
  target!: IMAGE_TARGET;

  @ApiProperty({ required: true, description: '이미지 파일', format: 'binary' })
  imageFiles!: string[];
}
