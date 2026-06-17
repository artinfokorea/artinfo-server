import { ApiProperty } from '@nestjs/swagger';

export type BulkEmailResult = {
  total: number;
  sent: number;
  failed: number;
  failures: { email: string; reason: string }[];
};

class BulkEmailFailure {
  @ApiProperty({ type: String }) email: string;
  @ApiProperty({ type: String }) reason: string;
}

export class OnchurchBulkEmailResultResponse {
  @ApiProperty({ type: Number, description: '요청한 총 수신자 수' }) total: number;
  @ApiProperty({ type: Number, description: '발송 성공 수' }) sent: number;
  @ApiProperty({ type: Number, description: '발송 실패 수' }) failed: number;
  @ApiProperty({ type: [BulkEmailFailure], description: '실패한 수신자 목록' }) failures: BulkEmailFailure[];

  constructor(result: BulkEmailResult) {
    this.total = result.total;
    this.sent = result.sent;
    this.failed = result.failed;
    this.failures = result.failures;
  }
}
