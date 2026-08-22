import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { ONGI_REPORT_TARGET_TYPE } from '@/ongi/report/domain/entity/ongi-report.entity';
import { OngiCreateReportCommand } from '@/ongi/report/application/usecase/ongi-report.usecase';

export class OngiCreateReportRequest {
  @IsEnum(ONGI_REPORT_TARGET_TYPE, { message: '신고 대상 종류가 올바르지 않아요.' })
  @ApiProperty({ enum: ONGI_REPORT_TARGET_TYPE, required: true, description: '신고 대상 종류', example: 'photo' })
  targetType: ONGI_REPORT_TARGET_TYPE;

  @IsNumberString({}, { message: '신고 대상 id 가 올바르지 않아요.' })
  @ApiProperty({ type: String, required: true, description: '신고 대상 id (사진·댓글·구성원 id)', example: '12' })
  targetId: string;

  @NotBlank()
  @MaxLength(500)
  @ApiProperty({ type: String, required: true, description: '신고 사유', example: '부적절한 사진이에요.' })
  reason: string;

  toCommand(): OngiCreateReportCommand {
    return { targetType: this.targetType, targetId: Number(this.targetId), reason: this.reason.trim() };
  }
}
