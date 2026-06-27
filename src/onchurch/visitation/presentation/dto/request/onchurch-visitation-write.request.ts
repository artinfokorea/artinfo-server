import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Matches, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchVisitationWriteCommand } from '@/onchurch/visitation/application/command/onchurch-visitation-write.command';

function nullableTrim(v: string | null | undefined): string | null {
  return (v ?? '').trim() || null;
}

export class OnchurchVisitationWriteRequest {
  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '심방 대상 성도 ID(성도명부 연결)' })
  saintId: number;

  @NotBlank()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '심방 대상 성도 이름(스냅샷)', example: '홍길동' })
  saintName: string;

  @IsOptional()
  @MaxLength(2000)
  @ApiProperty({ type: String, required: false, nullable: true, description: '심방에 참여한 성도들(텍스트)', example: '홍길동, 김영희' })
  participants: string | null;

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
      saintId: this.saintId,
      saintName: this.saintName.trim(),
      participants: nullableTrim(this.participants),
      minister: this.minister.trim(),
      type: this.type.trim(),
      date: this.date.trim(),
      content: nullableTrim(this.content),
    });
  }
}
