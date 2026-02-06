import { ApiProperty } from '@nestjs/swagger';

export class ExtractAdmissionRequest {
  @ApiProperty({ type: 'string', format: 'binary', required: true, description: '입시 요강 PDF 파일' })
  pdfFile: any;
}
