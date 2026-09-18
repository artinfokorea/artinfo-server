import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ArrayType } from '@/common/decorator/validator';
import { OnchurchCustomPageWriteCommand } from '@/onchurch/custom-page/application/command/onchurch-custom-page-write.command';
import { OnchurchCustomPageBlock } from '@/onchurch/custom-page/domain/entity/onchurch-custom-page.entity';

export class OnchurchCustomPageWriteRequest {
  @IsString()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '공개 URL 경로(/p/:slug). 영문 소문자·숫자·하이픈', example: 'vision' })
  slug: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({ type: String, required: true, description: '네비게이션에 노출되는 페이지 이름', example: '비전' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiProperty({ type: String, required: false, nullable: true, description: '제목 아래 한 줄 설명', example: '우리 교회가 바라보는 방향입니다.' })
  summary?: string | null;

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [Object], required: false, description: '본문 블록 배열. 지원 타입/옵션의 단일 소스는 프론트다' })
  blocks?: OnchurchCustomPageBlock[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false, default: true, description: '공개 사이트 노출 여부' })
  isActive?: boolean;

  toCommand(): OnchurchCustomPageWriteCommand {
    return new OnchurchCustomPageWriteCommand({
      slug: this.slug,
      title: this.title,
      summary: this.summary?.trim() || null,
      blocks: this.blocks ?? [],
      isActive: this.isActive ?? true,
    });
  }
}

export class OnchurchCustomPageToggleRequest {
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: true, description: '공개 사이트 노출 여부' })
  isActive: boolean;
}

export class OnchurchCustomPageReorderRequest {
  @ArrayType()
  @ApiProperty({ type: [Number], required: true, description: '노출 순서대로 나열한 페이지 ID 배열', example: [3, 1, 2] })
  orderedIds: number[];
}
