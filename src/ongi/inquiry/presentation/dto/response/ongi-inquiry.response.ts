import { ApiProperty } from '@nestjs/swagger';
import { OngiInquiry } from '@/ongi/inquiry/domain/entity/ongi-inquiry.entity';
import { inquiryStatusOf } from '@/ongi/inquiry/domain/service/ongi-inquiry-policy';

export class OngiInquiryResponse {
  @ApiProperty({ type: String, description: '문의 id' }) id: string;
  @ApiProperty({ type: String, description: "'open' | 'answered'" }) status: string;
  @ApiProperty({ type: String, description: '문의 내용' }) content: string;
  @ApiProperty({ type: String, required: false, description: '운영자 답변' }) answer?: string;
  @ApiProperty({ type: String, required: false, description: '답변 시각 (ISO)' }) answeredAt?: string;
  @ApiProperty({ type: String, description: '문의 시각 (ISO)' }) createdAt: string;

  constructor(inquiry: OngiInquiry) {
    this.id = String(inquiry.id);
    this.status = inquiryStatusOf(inquiry.answer);
    this.content = inquiry.content;
    this.answer = inquiry.answer ?? undefined;
    this.answeredAt = inquiry.answeredAt ? new Date(inquiry.answeredAt).toISOString() : undefined;
    this.createdAt = new Date(inquiry.createdAt).toISOString();
  }
}

export class OngiInquiryListResponse {
  @ApiProperty({ type: [OngiInquiryResponse], description: '내 문의 (최근 순, 최대 100개)' }) inquiries: OngiInquiryResponse[];

  constructor(inquiries: OngiInquiry[]) {
    this.inquiries = inquiries.map(inquiry => new OngiInquiryResponse(inquiry));
  }
}
