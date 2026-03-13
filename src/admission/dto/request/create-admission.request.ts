import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class CreateAdmissionRoundTaskRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true, description: '실기 과제 설명' })
  description: string;

  @IsNumber()
  @ApiProperty({ type: 'number', required: true, description: '순서' })
  sequence: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false, description: '비고' })
  note: string | null;
}

class CreateAdmissionRoundRequest {
  @IsNumber()
  @ApiProperty({ type: 'number', required: true, description: '차수' })
  roundNumber: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true, description: '실기고사 시작일 (ISO 8601)' })
  examStartAt: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true, description: '실기고사 종료일 (ISO 8601)' })
  examEndAt: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false, description: '합격자 발표일' })
  resultAt: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false, description: '등록 시작일' })
  registrationStartAt: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false, description: '등록 마감일' })
  registrationEndAt: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false, description: '비고' })
  note: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAdmissionRoundTaskRequest)
  @ApiProperty({ type: [CreateAdmissionRoundTaskRequest], required: true, description: '실기 과제 목록' })
  tasks: CreateAdmissionRoundTaskRequest[];
}

export class CreateAdmissionItemRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true, description: '학교명' })
  schoolName: string;

  @IsEnum(['GENERAL', 'SPECIAL'])
  @ApiProperty({ enum: ['GENERAL', 'SPECIAL'], required: true, description: '입시 유형 (GENERAL: 정시, SPECIAL: 수시)' })
  admissionType: 'GENERAL' | 'SPECIAL';

  @IsNumber()
  @ApiProperty({ type: 'number', required: true, description: '입시 년도' })
  year: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true, description: '전공 키워드 (DB 매칭용)' })
  majorKeyword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true, description: '원서접수 시작일 (ISO 8601)' })
  applicationStartAt: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true, description: '원서접수 마감일 (ISO 8601)' })
  applicationEndAt: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false, description: '원서접수 비고' })
  applicationNote: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false, description: '서류제출 시작일' })
  documentStartAt: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false, description: '서류제출 마감일' })
  documentEndAt: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false, description: '서류제출 비고' })
  documentNote: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false, description: '최종 합격자 발표일' })
  finalResultAt: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAdmissionRoundRequest)
  @ApiProperty({ type: [CreateAdmissionRoundRequest], required: true, description: '시험 라운드 목록' })
  rounds: CreateAdmissionRoundRequest[];
}

export class CreateAdmissionsRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAdmissionItemRequest)
  @ApiProperty({ type: [CreateAdmissionItemRequest], required: true, description: '입시 데이터 목록' })
  admissions: CreateAdmissionItemRequest[];
}
