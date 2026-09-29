import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsString } from 'class-validator';
import { ONGI_REPORT_STATUS } from '@/ongi/report/domain/entity/ongi-report.entity';
import { ONGI_USER_TYPE } from '@/ongi/user/domain/entity/ongi-user.entity';

export class OngiAdminReportStatusRequest {
  @IsIn([ONGI_REPORT_STATUS.OPEN, ONGI_REPORT_STATUS.RESOLVED], { message: '상태가 올바르지 않아요.' })
  @ApiProperty({ type: String, required: true, description: "'open' | 'resolved'", example: 'resolved' })
  status: string;
}

export class OngiAdminUserTypeRequest {
  @IsIn([ONGI_USER_TYPE.USER, ONGI_USER_TYPE.ADMIN], { message: '등급이 올바르지 않아요.' })
  @ApiProperty({ type: String, required: true, description: "'USER' | 'ADMIN' — SUPER_ADMIN 은 DB 에서만", example: 'ADMIN' })
  type: string;
}

export class OngiAdminUserTestRequest {
  @IsBoolean({ message: '값이 올바르지 않아요.' })
  @ApiProperty({ type: Boolean, required: true, description: 'true 면 테스트 계정 — 관리자 수치에서 뺀다', example: true })
  isTest: boolean;
}

export class OngiAdminConfigRequest {
  @IsString()
  @ApiProperty({ type: String, required: true, description: '설정 키', example: 'min_android_version' })
  key: string;

  @IsString()
  @ApiProperty({ type: String, required: true, description: '버전 (x.y.z)', example: '1.0.3' })
  value: string;
}

export class OngiAdminInquiryAnswerRequest {
  @IsString({ message: '답변이 올바르지 않아요.' })
  @ApiProperty({
    type: String,
    required: true,
    description: '답변 (2000자까지) — 빈 문자열이면 답변 없이 완료 처리, 다시 보내면 수정',
    example: '확인해 보니 해결됐어요.',
  })
  answer: string;
}
