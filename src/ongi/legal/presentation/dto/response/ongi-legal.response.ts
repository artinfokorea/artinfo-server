import { ApiProperty } from '@nestjs/swagger';
import { OngiLegalDoc } from '@/ongi/legal/domain/constant/ongi-legal.constant';

export class OngiLegalDocResponse {
  @ApiProperty({ type: String, description: '문서 slug (terms | privacy)' })
  slug: string;

  @ApiProperty({ type: String, description: '문서 제목' })
  title: string;

  @ApiProperty({ type: String, description: '최근 수정일 (표시용)', example: '2026년 1월 1일' })
  updatedAt: string;

  @ApiProperty({ type: String, description: '본문' })
  body: string;

  constructor(doc: OngiLegalDoc) {
    this.slug = doc.slug;
    this.title = doc.title;
    this.updatedAt = doc.updatedAt;
    this.body = doc.body;
  }
}
