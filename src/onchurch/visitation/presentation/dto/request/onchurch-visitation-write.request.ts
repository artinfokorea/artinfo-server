import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Matches, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchVisitationWriteCommand } from '@/onchurch/visitation/application/command/onchurch-visitation-write.command';

function nullableTrim(v: string | null | undefined): string | null {
  return (v ?? '').trim() || null;
}

export class OnchurchVisitationWriteRequest {
  @IsOptional()
  @IsInt()
  @ApiProperty({ type: Number, required: false, nullable: true, description: '성도 ID(성도명부에서 선택 시)' })
  saintId: number | null;

  @NotBlank()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '성도(심방 대상)', example: '홍길동' })
  saintName: string;

  @NotBlank()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '교역자', example: '김목사' })
  minister: string;

  @NotBlank()
  @MaxLength(40)
  @ApiProperty({ type: String, required: true, description: '심방 종류', example: '대심방' })
  type: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)' })
  @ApiProperty({ type: String, required: true, description: '심방 날짜(YYYY-MM-DD)', example: '2026-06-27' })
  date: string;

  @IsOptional()
  @MaxLength(5000)
  @ApiProperty({ type: String, required: false, nullable: true, description: '심방 내용' })
  content: string | null;

  toCommand(): OnchurchVisitationWriteCommand {
    return new OnchurchVisitationWriteCommand({
      saintId: this.saintId ?? null,
      saintName: this.saintName.trim(),
      minister: this.minister.trim(),
      type: this.type.trim(),
      date: this.date.trim(),
      content: nullableTrim(this.content),
    });
  }
}
