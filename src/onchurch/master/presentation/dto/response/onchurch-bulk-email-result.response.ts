import { ApiProperty } from '@nestjs/swagger';
import { OnchurchEmailRecipientResult, OnchurchEmailRecipientStatus } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';

export type BulkEmailResult = {
  total: number;
  sent: number;
  failed: number;
  excluded: number;
  results: OnchurchEmailRecipientResult[];
};

class BulkEmailRecipientResult {
  @ApiProperty({ type: String }) email: string;
  @ApiProperty({ type: String, enum: ['sent', 'failed', 'excluded'], description: '발송 성공/실패/제외' })
  status: OnchurchEmailRecipientStatus;
  @ApiProperty({ type: String, nullable: true, description: '제외·실패 사유' }) reason: string | null;
}

export class OnchurchBulkEmailResultResponse {
  @ApiProperty({ type: Number, description: '요청한 총 수신자 수(중복 제거 후)' }) total: number;
  @ApiProperty({ type: Number, description: '발송 성공 수' }) sent: number;
  @ApiProperty({ type: Number, description: '발송 실패 수' }) failed: number;
  @ApiProperty({ type: Number, description: '발송 전 제외 수(검증 탈락)' }) excluded: number;
  @ApiProperty({ type: [BulkEmailRecipientResult], description: '수신자별 결과' }) results: BulkEmailRecipientResult[];

  constructor(result: BulkEmailResult) {
    this.total = result.total;
    this.sent = result.sent;
    this.failed = result.failed;
    this.excluded = result.excluded;
    this.results = result.results;
  }
}
