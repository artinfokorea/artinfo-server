import { ApiProperty } from '@nestjs/swagger';
import { OnchurchEmailLog } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';

class EmailLogFailure {
  @ApiProperty({ type: String }) email: string;
  @ApiProperty({ type: String }) reason: string;
}

export class OnchurchEmailLogResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: Number, description: '발송한 마스터 계정 ID' }) senderId: number;
  @ApiProperty({ type: String, description: '발송한 마스터 이름' }) senderName: string;
  @ApiProperty({ type: String, description: '메일 제목' }) subject: string;
  @ApiProperty({ type: String, description: '메일 본문' }) content: string;
  @ApiProperty({ type: [String], description: '수신자 이메일 목록' }) recipients: string[];
  @ApiProperty({ type: Number }) total: number;
  @ApiProperty({ type: Number }) sent: number;
  @ApiProperty({ type: Number }) failed: number;
  @ApiProperty({ type: [EmailLogFailure] }) failures: EmailLogFailure[];
  @ApiProperty({ type: String, description: '발송 일시 (ISO)' }) createdAt: string;

  constructor(log: OnchurchEmailLog) {
    this.id = log.id;
    this.senderId = log.senderId;
    this.senderName = log.senderName;
    this.subject = log.subject;
    this.content = log.content;
    this.recipients = log.recipients;
    this.total = log.total;
    this.sent = log.sent;
    this.failed = log.failed;
    this.failures = log.failures;
    this.createdAt = log.createdAt.toISOString();
  }
}

export class OnchurchEmailLogListResponse {
  @ApiProperty({ type: [OnchurchEmailLogResponse] }) items: OnchurchEmailLogResponse[];

  constructor(logs: OnchurchEmailLog[]) {
    this.items = logs.map((log) => new OnchurchEmailLogResponse(log));
  }
}
