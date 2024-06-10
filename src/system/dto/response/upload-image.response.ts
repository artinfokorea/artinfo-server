import { Image, IMAGE_TARGET } from '@/system/entity/image.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponse {
  @ApiProperty({ required: true, description: '이미지 아이디', example: new Date() })
  id!: number;

  @ApiProperty({ required: true, description: '이미지 타겟', example: IMAGE_TARGET.USER })
  target!: IMAGE_TARGET;

  @ApiProperty({ required: true, description: '원본 파일명', example: 'sample.png' })
  originalFilename!: string;

  @ApiProperty({ required: true, description: 'mime type', example: 'image/png' })
  mimeType!: string;

  @ApiProperty({ required: true, description: '이미지 너비', example: 600 })
  width!: number;

  @ApiProperty({ required: true, description: '이미지 높이', example: 900 })
  height!: number;

  @ApiProperty({ required: true, description: '이미지 크기 (바이트)', example: 1813883 })
  size!: number;

  @ApiProperty({ required: true, description: '연결된 URL', example: 'https://resource.test.com/aaaa/casc/sample.png' })
  url!: string;

  constructor(image: Image) {
    this.id = image.id;
    this.target = image.target;
    this.originalFilename = image.originalFilename;
    this.mimeType = image.mimeType;
    this.width = image.width;
    this.height = image.height;
    this.size = image.size;
    this.url = new URL(image.savedPath, 'https://artinfo.s3.ap-northeast-2.amazonaws.com').toString();
  }
}
