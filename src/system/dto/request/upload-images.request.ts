import { ApiProperty } from '@nestjs/swagger';
import { CreateImagesCommand } from '@/system/dto/command/create-images.command';
import { IMAGE_TARGET } from '@/system/entity/image.entity';
import { UploadFile } from '@/common/type/type';

export class UploadImagesRequest {
  @ApiProperty({ enum: IMAGE_TARGET, enumName: 'IMAGE_TARGET', required: true, description: '업로드 대상', example: IMAGE_TARGET.USER })
  target: IMAGE_TARGET;

  @ApiProperty({ required: true, description: '이미지 파일', format: 'binary' })
  imageFiles: UploadFile[];

  @ApiProperty({ required: true, description: '압축 여부', example: true, default: true })
  compress: boolean;

  toCreateImagesCommand(userId: number, files: UploadFile[]) {
    return new CreateImagesCommand({
      userId: userId,
      target: this.target,
      files: files,
      compress: this.compress,
    });
  }
}
