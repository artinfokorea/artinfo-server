import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
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

export class OngiAdminConfigRequest {
  @IsString()
  @ApiProperty({ type: String, required: true, description: '설정 키', example: 'min_android_version' })
  key: string;

  @IsString()
  @ApiProperty({ type: String, required: true, description: '버전 (x.y.z)', example: '1.0.3' })
  value: string;
}
