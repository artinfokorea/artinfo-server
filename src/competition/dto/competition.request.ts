import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEmail, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { List } from '@/common/type/type';
import { APPLY_METHODS, ApplyMethod, COMPETITION_PHASES, CompetitionListFilter, CompetitionPhase, CompetitionWrite } from '../competition.types';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const toArray = ({ value }: { value: unknown }) => (value === undefined || value === null || value === '' ? [] : Array.isArray(value) ? value : [value]);
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const emptyToNull = ({ value }: { value: unknown }) => (typeof value === 'string' && value.trim() === '' ? null : value);

export class GetCompetitionsRequest extends List {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '대회명·주최·지역 검색' })
  keyword?: string;

  @Transform(toArray)
  @IsArray()
  @IsIn(COMPETITION_PHASES, { each: true })
  @ApiProperty({ type: [String], required: false, description: '접수 상태 (비우면 종료 제외 전체). OPEN 은 SOON 포함', example: ['OPEN'] })
  phases: CompetitionPhase[] = [];

  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false, description: '부문 (하나라도 겹치면)', example: ['피아노'] })
  divisions: string[] = [];

  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false, description: '지역', example: ['서울'] })
  areas: string[] = [];

  toFilter(): CompetitionListFilter {
    return { page: this.page, size: this.size, keyword: this.keyword ?? null, phases: this.phases, divisions: this.divisions, areas: this.areas };
  }
}

export class CompetitionWriteRequest {
  @Transform(trim)
  @NotBlank()
  @MaxLength(120)
  @ApiProperty({ type: String, required: true, example: '제13회 수원시전국음악콩쿠르' })
  title: string;

  @Transform(trim)
  @NotBlank()
  @MaxLength(80)
  @ApiProperty({ type: String, required: true, description: '주최', example: '(사)한국음악협회 수원시지부' })
  host: string;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @ApiProperty({ type: String, required: false, description: '주관' })
  organizer?: string | null;

  @Transform(trim)
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '지역 (서울·경기·… ·전국)', example: '경기' })
  area: string;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @ApiProperty({ type: String, required: false, description: '대회 장소' })
  venue?: string | null;

  @Transform(toArray)
  @IsArray()
  @ArrayMinSize(1, { message: '부문을 하나 이상 선택해 주세요.' })
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: true, description: '부문', example: ['피아노', '성악'] })
  divisions: string[];

  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false, description: '참가 대상', example: ['중등', '고등'] })
  ages: string[] = [];

  @Matches(DATE, { message: '접수 시작일은 YYYY-MM-DD 형식이어야 합니다.' })
  @ApiProperty({ type: String, required: true, description: '접수 시작 YYYY-MM-DD' })
  openAt: string;

  @Matches(DATE, { message: '접수 마감일은 YYYY-MM-DD 형식이어야 합니다.' })
  @ApiProperty({ type: String, required: true, description: '접수 마감 YYYY-MM-DD (그날 23:59 까지)' })
  closeAt: string;

  @IsOptional()
  @Transform(emptyToNull)
  @Matches(DATE)
  @ApiProperty({ type: String, required: false, description: '대회일' })
  heldAt?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @Matches(DATE)
  @ApiProperty({ type: String, required: false, description: '결과 발표일' })
  resultAt?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @ApiProperty({ type: String, required: false, description: '참가비', example: '부문당 60,000원' })
  fee?: string | null;

  @IsIn(APPLY_METHODS, { message: '접수 방법은 LINK·EMAIL·POST 중 하나여야 합니다.' })
  @ApiProperty({ type: String, required: true, description: '접수 방법 LINK(홈페이지·폼) / EMAIL / POST(우편·방문)', example: 'LINK' })
  applyMethod: ApplyMethod;

  @Transform(emptyToNull)
  @ValidateIf(o => o.applyMethod === 'LINK' || (o.applyLink !== null && o.applyLink !== undefined))
  @Matches(/^https?:\/\/.+/, { message: '접수 링크는 https:// 로 시작하는 주소여야 합니다.' })
  @ApiProperty({ type: String, required: false, description: '접수 링크 — applyMethod 가 LINK 면 필수, https:// 로 시작' })
  applyLink?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @ApiProperty({ type: String, required: false })
  tel?: string | null;

  @Transform(emptyToNull)
  @ValidateIf(o => o.applyMethod === 'EMAIL' || (o.email !== null && o.email !== undefined))
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  @ApiProperty({ type: String, required: false, description: '문의·접수 이메일 — applyMethod 가 EMAIL 이면 필수' })
  email?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @ApiProperty({ type: String, required: false, description: '시상 내역 (줄바꿈 가능)' })
  prize?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @ApiProperty({ type: String, required: false, description: '소개·안내' })
  description?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @ApiProperty({ type: String, required: false, description: '포스터 이미지 URL' })
  posterUrl?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @ApiProperty({ type: String, required: false, description: '요강 파일 URL' })
  documentUrl?: string | null;

  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20, { message: '본문 이미지는 20장까지 올릴 수 있습니다.' })
  @ApiProperty({ type: [String], required: false, description: '본문 이미지 URL (포스터와 별개, 최대 20장)' })
  contentImages: string[] = [];

  toWrite(): CompetitionWrite {
    return {
      title: this.title.trim(),
      host: this.host.trim(),
      organizer: this.organizer ?? null,
      area: this.area.trim(),
      venue: this.venue ?? null,
      divisions: this.divisions.map(d => d.trim()).filter(Boolean),
      ages: this.ages.map(a => a.trim()).filter(Boolean),
      openAt: this.openAt,
      closeAt: this.closeAt,
      heldAt: this.heldAt ?? null,
      resultAt: this.resultAt ?? null,
      fee: this.fee ?? null,
      applyMethod: this.applyMethod,
      applyLink: this.applyLink ?? null,
      tel: this.tel ?? null,
      email: this.email ?? null,
      prize: this.prize ?? null,
      description: this.description ?? null,
      posterUrl: this.posterUrl ?? null,
      documentUrl: this.documentUrl ?? null,
      contentImages: this.contentImages.map(u => u.trim()).filter(Boolean),
    };
  }
}

/** 관리자 수동 수집 — limit 을 주면 목록 앞에서 그 개수만 (1~200, 50건 넘으면 다음 페이지를 이어 읽음). 비우면 스케줄과 같이 1페이지 50건 */
export class CrawlCompetitionsRequest {
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(200)
  @ApiProperty({ type: Number, required: false, description: '목록 앞에서부터 볼 개수 (1~200). 비우면 50', example: 100 })
  limit?: number;
}
