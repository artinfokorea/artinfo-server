import { ApiProperty } from '@nestjs/swagger';

/** 발송 결과 — 전역 ResponseInterceptor 가 { code, message, item } 으로 감싼다 */
export class PushSendResultResponse {
  @ApiProperty({ type: Number, required: true, description: '발송 요청한 기기 수', example: 3 })
  sent: number;

  @ApiProperty({ type: Number, required: true, description: '집계된 새 채용 공고 수 (최근 24시간)', example: 5 })
  jobCount: number;

  constructor(result: { sent: number; jobCount: number }) {
    this.sent = result.sent;
    this.jobCount = result.jobCount;
  }
}
