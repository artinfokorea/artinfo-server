import { ApiProperty } from '@nestjs/swagger';
import { UploadFile } from '@/common/type/type';

export class UploadFilesRequest {
  @ApiProperty({ required: true, description: '첨부파일(이미지 외 형식 포함)', format: 'binary' })
  files: UploadFile[];
}
