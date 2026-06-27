import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsIn, IsInt, IsOptional, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchSaintGender } from '@/onchurch/saint/domain/entity/onchurch-saint.entity';
import { OnchurchSaintWriteCommand } from '@/onchurch/saint/application/command/onchurch-saint-write.command';

const GENDERS: OnchurchSaintGender[] = ['male', 'female'];

function nullableTrim(v: string | null | undefined): string | null {
  return (v ?? '').trim() || null;
}

export class OnchurchSaintWriteRequest {
  @NotBlank()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '이름', example: '홍길동' })
  name: string;

  @IsOptional()
  @MaxLength(1000)
  @ApiProperty({ type: String, required: false, nullable: true, description: '사진 URL' })
  photoUrl: string | null;

  @IsOptional()
  @MaxLength(10)
  @ApiProperty({ type: String, required: false, nullable: true, description: '생년월일(YYYY-MM-DD)', example: '1980-03-15' })
  birthDate: string | null;

  @IsOptional()
  @IsIn(GENDERS)
  @ApiProperty({ enum: GENDERS, required: false, nullable: true, description: '성별' })
  gender: OnchurchSaintGender | null;

  @IsOptional()
  @MaxLength(40)
  @ApiProperty({ type: String, required: false, nullable: true, description: '연락처', example: '010-1234-5678' })
  phone: string | null;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  @ApiProperty({ type: String, required: false, nullable: true, description: '이메일' })
  email: string | null;

  @IsOptional()
  @MaxLength(500)
  @ApiProperty({ type: String, required: false, nullable: true, description: '주소' })
  address: string | null;

  @IsOptional()
  @MaxLength(40)
  @ApiProperty({ type: String, required: false, nullable: true, description: '직분', example: '집사' })
  position: string | null;

  @IsOptional()
  @MaxLength(10)
  @ApiProperty({ type: String, required: false, nullable: true, description: '임직일(YYYY-MM-DD)' })
  ordinationDate: string | null;

  @IsOptional()
  @MaxLength(40)
  @ApiProperty({ type: String, required: false, nullable: true, description: '신급', example: '세례' })
  faithLevel: string | null;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ApiProperty({ type: [Number], required: false, description: '연결할 태그 ID 목록', example: [1, 2] })
  tagIds?: number[];

  toCommand(): OnchurchSaintWriteCommand {
    return new OnchurchSaintWriteCommand({
      name: this.name.trim(),
      photoUrl: nullableTrim(this.photoUrl),
      birthDate: nullableTrim(this.birthDate),
      gender: this.gender ?? null,
      phone: nullableTrim(this.phone),
      email: nullableTrim(this.email),
      address: nullableTrim(this.address),
      position: nullableTrim(this.position),
      ordinationDate: nullableTrim(this.ordinationDate),
      faithLevel: nullableTrim(this.faithLevel),
    });
  }
}
