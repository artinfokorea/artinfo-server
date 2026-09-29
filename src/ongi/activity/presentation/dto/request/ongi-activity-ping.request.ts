import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

/**
 * 형식 검사를 일부러 하지 않는다 — 통계용 요청이 400 으로 실패해 앱에 오류가 보이면 안 된다.
 * 잘못된 값은 서버가 걸러 0 · null 로 저장한다 (ongi-activity-policy).
 */
export class OngiActivityPingRequest {
  @IsOptional()
  @ApiProperty({ type: Number, required: false, description: '지난 전송 뒤로 앱을 화면에 띄워 둔 시간(초). 한 번에 최대 1800', example: 60 })
  seconds?: number;

  @IsOptional()
  @ApiProperty({ type: Boolean, required: false, description: '새 방문의 첫 전송이면 true (앱을 켰거나 5분 넘게 떠났다 돌아옴)' })
  newSession?: boolean;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: 'ios | android' })
  platform?: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '앱 버전', example: '1.0.10' })
  appVersion?: string;
}
