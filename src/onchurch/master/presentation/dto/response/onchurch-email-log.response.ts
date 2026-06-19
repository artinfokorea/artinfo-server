import { ApiProperty } from '@nestjs/swagger';
import { OnchurchEmailLog, OnchurchEmailLogStatus, OnchurchEmailRecipientStatus } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';

class EmailLogRecipientResult {
  @ApiProperty({ type: String }) email: string;
  @ApiProperty({ type: String, enum: ['sent', 'failed', 'excluded'] }) status: OnchurchEmailRecipientStatus;
  @ApiProperty({ type: String, nullable: true }) reason: string | null;
}

export class OnchurchEmailLogResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: Number, description: '발송한 마스터 계정 ID' }) senderId: number;
  @ApiProperty({ type: String, description: '발송한 마스터 이름' }) senderName: string;
  @ApiProperty({ type: String, description: '메일 제목' }) subject: string;
  @ApiProperty({ type: String, description: '메일 본문' }) content: string;
  @ApiProperty({ type: [EmailLogRecipientResult], description: '수신자별 결과(성공/실패/제외)' }) results: EmailLogRecipientResult[];
  @ApiProperty({ type: Number }) total: number;
  @ApiProperty({ type: Number }) sent: number;
  @ApiProperty({ type: Number }) failed: number;
  @ApiProperty({ type: Number }) excluded: number;
  @ApiProperty({ type: String, enum: ['queued', 'processing', 'completed'], description: '발송 진행 상태' }) status: OnchurchEmailLogStatus;
  @ApiProperty({ type: String, description: '발송 일시 (ISO)' }) createdAt: string;

  constructor(log: OnchurchEmailLog) {
    this.id = log.id;
    this.senderId = log.senderId;
    this.senderName = log.senderName;
    this.subject = log.subject;
    this.content = log.content;
    this.results = log.results;
    this.total = log.total;
    this.sent = log.sent;
    this.failed = log.failed;
    this.excluded = log.excluded;
    this.status = log.status;
    this.createdAt = log.createdAt.toISOString();
  }
}

export class OnchurchEmailLogListResponse {
  @ApiProperty({ type: [OnchurchEmailLogResponse] }) items: OnchurchEmailLogResponse[];
  @ApiProperty({ type: Number, description: '검색 조건에 해당하는 전체 건수' }) totalCount: number;

  constructor(params: { items: OnchurchEmailLog[]; totalCount: number }) {
    this.items = params.items.map((log) => new OnchurchEmailLogResponse(log));
    this.totalCount = params.totalCount;
  }
}
