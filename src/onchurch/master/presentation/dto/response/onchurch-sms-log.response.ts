import { ApiProperty } from '@nestjs/swagger';
import { OnchurchSmsLog, OnchurchSmsRecipientStatus } from '@/onchurch/master/domain/entity/onchurch-sms-log.entity';

class SmsLogRecipientResult {
  @ApiProperty({ type: String }) phone: string;
  @ApiProperty({ type: String, enum: ['sent', 'failed', 'excluded'] }) status: OnchurchSmsRecipientStatus;
  @ApiProperty({ type: String, nullable: true }) reason: string | null;
}

export class OnchurchSmsLogResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: Number, description: '발송한 마스터 계정 ID' }) senderId: number;
  @ApiProperty({ type: String, description: '발송한 마스터 이름' }) senderName: string;
  @ApiProperty({ type: String, description: '문자 제목' }) subject: string;
  @ApiProperty({ type: String, description: '문자 본문' }) content: string;
  @ApiProperty({ type: [SmsLogRecipientResult], description: '수신자별 결과(성공/실패/제외)' }) results: SmsLogRecipientResult[];
  @ApiProperty({ type: Number }) total: number;
  @ApiProperty({ type: Number }) sent: number;
  @ApiProperty({ type: Number }) failed: number;
  @ApiProperty({ type: Number }) excluded: number;
  @ApiProperty({ type: String, description: '발송 일시 (ISO)' }) createdAt: string;

  constructor(log: OnchurchSmsLog) {
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
    this.createdAt = log.createdAt.toISOString();
  }
}

export class OnchurchSmsLogListResponse {
  @ApiProperty({ type: [OnchurchSmsLogResponse] }) items: OnchurchSmsLogResponse[];
  @ApiProperty({ type: Number, description: '검색 조건에 해당하는 전체 건수' }) totalCount: number;

  constructor(params: { items: OnchurchSmsLog[]; totalCount: number }) {
    this.items = params.items.map((log) => new OnchurchSmsLogResponse(log));
    this.totalCount = params.totalCount;
  }
}
