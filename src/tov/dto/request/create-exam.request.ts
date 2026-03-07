import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateExamRequest {
  @ApiProperty({ description: '유저 ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty({ message: '유저 ID는 필수입니다.' })
  @IsUUID('4', { message: '유저 ID는 UUID 형식이어야 합니다.' })
  userId: string;

  @ApiProperty({ description: '단어 그룹 ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty({ message: '단어 그룹 ID는 필수입니다.' })
  @IsUUID('4', { message: '단어 그룹 ID는 UUID 형식이어야 합니다.' })
  groupId: string;

  @ApiProperty({ description: '시작 챕터 번호', example: 1 })
  @IsNotEmpty({ message: '시작 챕터 번호는 필수입니다.' })
  @IsInt()
  @Min(1, { message: '챕터 번호는 1 이상이어야 합니다.' })
  chapterFrom: number;

  @ApiProperty({ description: '종료 챕터 번호', example: 3 })
  @IsNotEmpty({ message: '종료 챕터 번호는 필수입니다.' })
  @IsInt()
  @Min(1, { message: '챕터 번호는 1 이상이어야 합니다.' })
  chapterTo: number;

  @ApiProperty({ description: '시작 스텝 번호 (null이면 챕터 처음부터)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  stepFrom?: number;

  @ApiProperty({ description: '종료 스텝 번호 (null이면 챕터 끝까지)', example: 5, required: false })
  @IsOptional()
  @IsInt()
  stepTo?: number;

  @ApiProperty({ description: '문제 수', example: 20 })
  @IsNotEmpty({ message: '문제 수는 필수입니다.' })
  @IsInt()
  @Min(30, { message: '문제 수는 30 이상이어야 합니다.' })
  @Max(300, { message: '문제 수는 300 이하여야 합니다.' })
  size: number;
}
