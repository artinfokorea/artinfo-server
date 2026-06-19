import { ApiProperty } from '@nestjs/swagger';

// 대량 메일 발송 "접수" 응답. 실제 발송은 큐 워커가 백그라운드로 진행하며,
// 진행 상황은 logId로 GET /onchurch/master/emails/:id 를 폴링해 확인한다.
export class OnchurchEnqueueBulkEmailResponse {
  @ApiProperty({ type: Number, description: '발송 로그 ID(진행 상황 조회에 사용)' }) logId: number;
  @ApiProperty({ type: Number, description: '큐에 적재된 총 수신자 수(중복 제거 후)' }) total: number;

  constructor(result: { logId: number; total: number }) {
    this.logId = result.logId;
    this.total = result.total;
  }
}
