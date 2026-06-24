import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchAttendanceMarkCommand } from '@/onchurch/attendance/application/command/onchurch-attendance-mark.command';

export class OnchurchAttendanceMarkRequest {
  @NotBlank()
  @MaxLength(10)
  @ApiProperty({ type: String, required: true, description: '날짜(YYYY-MM-DD)', example: '2026-06-28' })
  date: string;

  @NotBlank()
  @MaxLength(40)
  @ApiProperty({ type: String, required: true, description: '예배종류', example: '주일오전예배' })
  serviceType: string;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '성도 ID' })
  saintId: number;

  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '출석 여부' })
  present: boolean;

  toCommand(): OnchurchAttendanceMarkCommand {
    return new OnchurchAttendanceMarkCommand({
      date: this.date.trim(),
      serviceType: this.serviceType.trim(),
      saintId: this.saintId,
      present: !!this.present,
    });
  }
}
