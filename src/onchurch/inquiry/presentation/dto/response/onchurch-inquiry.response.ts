import { ApiProperty } from '@nestjs/swagger';
import { OnchurchInquiry } from '@/onchurch/inquiry/domain/entity/onchurch-inquiry.entity';

export class OnchurchInquiryResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) question: string;
  @ApiProperty({ type: String, nullable: true }) answer: string | null;
  @ApiProperty({ type: String, nullable: true }) answeredAt: string | null;
  @ApiProperty({ type: String }) status: 'pending' | 'answered';
  @ApiProperty({ type: String }) createdAt: string;

  constructor(it: OnchurchInquiry) {
    this.id = it.id;
    this.question = it.question;
    this.answer = it.answer ?? null;
    this.answeredAt = it.answeredAt ? it.answeredAt.toISOString() : null;
    this.status = it.answer ? 'answered' : 'pending';
    this.createdAt = it.createdAt instanceof Date ? it.createdAt.toISOString() : String(it.createdAt);
  }
}

export class OnchurchInquiryListResponse {
  @ApiProperty({ type: [OnchurchInquiryResponse] })
  inquiries: OnchurchInquiryResponse[];

  constructor(items: OnchurchInquiry[]) {
    this.inquiries = items.map((it) => new OnchurchInquiryResponse(it));
  }
}
