import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { ImportTarget, WordpressImportRequest, WordpressImportResult } from '@/onchurch/importer/onchurch-wordpress-import.usecase';

const TARGETS: ImportTarget[] = ['sermon', 'notice', 'gallery', 'community'];

export class OnchurchWordpressSourceRequest {
  @IsString()
  @MaxLength(300)
  @ApiProperty({ type: String, description: '워드프레스 사이트 주소', example: 'http://chambit.org' })
  sourceUrl: string;
}

export class OnchurchWordpressMappingDto {
  @IsInt()
  @ApiProperty({ type: Number, description: '워드프레스 카테고리 id' })
  categoryId: number;

  @IsString()
  @MaxLength(50)
  @ApiProperty({ type: String, description: '온교회에서 쓸 카테고리(시리즈) 이름' })
  name: string;

  @IsIn(TARGETS)
  @ApiProperty({ enum: TARGETS, description: '옮길 곳' })
  target: ImportTarget;
}

export class OnchurchWordpressImportRequest extends OnchurchWordpressSourceRequest {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OnchurchWordpressMappingDto)
  @ApiProperty({ type: [OnchurchWordpressMappingDto] })
  mappings: OnchurchWordpressMappingDto[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @ApiProperty({ type: String, required: false, nullable: true, description: '설교자 이름' })
  pastorName: string | null;

  @IsString()
  @MaxLength(80)
  @ApiProperty({ type: String, description: '교제 글 작성자 이름' })
  authorName: string;

  @IsInt()
  @Min(1)
  @ApiProperty({ type: Number })
  page: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ type: Number })
  perPage: number;

  toRequest(): WordpressImportRequest {
    return {
      sourceUrl: this.sourceUrl,
      mappings: this.mappings.map(m => ({ categoryId: m.categoryId, name: m.name.trim(), target: m.target })),
      pastorName: this.pastorName ?? null,
      authorName: this.authorName.trim() || '관리자',
      page: this.page,
      perPage: this.perPage,
    };
  }
}

export class OnchurchWordpressCategoryDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() count: number;
}

export class OnchurchWordpressCategoriesResponse {
  @ApiProperty({ type: [OnchurchWordpressCategoryDto] }) categories: OnchurchWordpressCategoryDto[];
  constructor(categories: OnchurchWordpressCategoryDto[]) {
    this.categories = categories;
  }
}

export class OnchurchWordpressImportResponse {
  @ApiProperty() imported: number;
  @ApiProperty() skipped: number;
  @ApiProperty() failed: number;
  @ApiProperty() totalPages: number;
  @ApiProperty({ type: Number, nullable: true }) nextPage: number | null;
  @ApiProperty({ type: [String] }) errors: string[];
  constructor(r: WordpressImportResult) {
    this.imported = r.imported;
    this.skipped = r.skipped;
    this.failed = r.failed;
    this.totalPages = r.totalPages;
    this.nextPage = r.nextPage;
    this.errors = r.errors;
  }
}
