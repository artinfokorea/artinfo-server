import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchStaffWriteCommand } from '@/onchurch/about/application/command/onchurch-about-write.command';

export class OnchurchStaffWriteRequest {
  @NotBlank()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '이름' })
  name: string;

  @IsOptional()
  @MaxLength(80)
  @ApiProperty({ type: String, required: false, description: '직책', nullable: true })
  role: string | null;

  @IsOptional()
  @MaxLength(200)
  @ApiProperty({ type: String, required: false, description: '담당 사역', nullable: true })
  area: string | null;

  @IsOptional()
  @MaxLength(1000)
  @ApiProperty({ type: String, required: false, description: '사진 URL', nullable: true })
  photoUrl: string | null;

  @IsOptional()
  @MaxLength(40)
  @ApiProperty({ type: String, required: false, description: '연락처', nullable: true })
  phone: string | null;

  @IsOptional()
  @MaxLength(200)
  @ApiProperty({ type: String, required: false, description: '이메일', nullable: true })
  email: string | null;

  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '정렬 순서' })
  sortOrder: number;

  toCommand(): OnchurchStaffWriteCommand {
    return new OnchurchStaffWriteCommand({
      name: this.name.trim(),
      role: (this.role ?? '').trim() || null,
      area: (this.area ?? '').trim() || null,
      photoUrl: (this.photoUrl ?? '').trim() || null,
      phone: (this.phone ?? '').trim() || null,
      email: (this.email ?? '').trim() || null,
      sortOrder: this.sortOrder ?? 0,
    });
  }
}
