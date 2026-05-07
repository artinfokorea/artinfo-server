import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchPastorWriteCommand } from '@/onchurch/about/application/command/onchurch-about-write.command';

export class OnchurchPastorWriteRequest {
  @NotBlank()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '담임목사 이름' })
  name: string;

  @IsOptional()
  @MaxLength(80)
  @ApiProperty({ type: String, required: false, description: '직책', nullable: true })
  role: string | null;

  @IsOptional()
  @MaxLength(80)
  @ApiProperty({ type: String, required: false, description: '영문 이름', nullable: true })
  eng: string | null;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '인사말 (요약)', nullable: true })
  message: string | null;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '인사말 (상세)', nullable: true })
  longMessage: string | null;

  @IsOptional()
  @MaxLength(1000)
  @ApiProperty({ type: String, required: false, description: '사진 URL', nullable: true })
  photoUrl: string | null;

  toCommand(): OnchurchPastorWriteCommand {
    return new OnchurchPastorWriteCommand({
      name: this.name.trim(),
      role: (this.role ?? '').trim() || null,
      eng: (this.eng ?? '').trim() || null,
      message: this.message ?? null,
      longMessage: this.longMessage ?? null,
      photoUrl: (this.photoUrl ?? '').trim() || null,
    });
  }
}
