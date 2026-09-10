import { ApiProperty } from '@nestjs/swagger';
import { SalpyeoInquiry } from '@/salpyeo/inquiry/domain/entity/salpyeo-inquiry.entity';

export class SalpyeoInquiryResponse {
  @ApiProperty({ type: Number, description: '접수번호' }) id: number;
  @ApiProperty({ type: String, description: '제목' }) title: string;
  @ApiProperty({ type: String, description: '문의 내용' }) content: string;
  @ApiProperty({ type: String, description: '답변받을 이메일' }) email: string;
  @ApiProperty({ type: [String], description: '첨부 사진 URL' }) images: string[];
  @ApiProperty({ type: Boolean, description: '처리 완료 여부' }) isResolved: boolean;
  @ApiProperty({ type: Date, description: '접수 시각' }) createdAt: Date;

  constructor(inquiry: SalpyeoInquiry) {
    this.id = inquiry.id;
    this.title = inquiry.title;
    this.content = inquiry.content;
    this.email = inquiry.email;
    this.images = inquiry.images ?? [];
    this.isResolved = inquiry.isResolved;
    this.createdAt = inquiry.createdAt;
  }
}

export class SalpyeoInquiriesResponse {
  @ApiProperty({ type: [SalpyeoInquiryResponse], description: '최근 접수 순' }) inquiries: SalpyeoInquiryResponse[];

  constructor(items: SalpyeoInquiry[]) {
    this.inquiries = items.map(i => new SalpyeoInquiryResponse(i));
  }
}
