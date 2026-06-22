import { ApiProperty } from '@nestjs/swagger';
import { UploadedFileMeta } from '@/system/service/system.service';

export class UploadFileResponse {
  @ApiProperty({ type: String, description: '다운로드 URL' }) url: string;
  @ApiProperty({ type: String, description: '원본 파일명' }) name: string;
  @ApiProperty({ type: Number, description: '파일 크기(byte)' }) size: number;
  @ApiProperty({ type: String, description: 'MIME 타입' }) mimeType: string;

  constructor(meta: UploadedFileMeta) {
    this.url = meta.url;
    this.name = meta.name;
    this.size = meta.size;
    this.mimeType = meta.mimeType;
  }
}

export class UploadFilesResponse {
  @ApiProperty({ type: [UploadFileResponse], required: true, description: '업로드된 첨부파일 목록' })
  files: UploadFileResponse[];

  constructor(files: UploadedFileMeta[]) {
    this.files = files.map((f) => new UploadFileResponse(f));
  }
}
