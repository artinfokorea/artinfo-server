import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';
import { ArrayType } from '@/common/decorator/validator';
import {
  OnchurchBulletinNewsItem,
  OnchurchBulletinStaffItem,
  OnchurchBulletinVolunteerItem,
  OnchurchBulletinWorshipOrderItem,
  OnchurchBulletinWorshipServiceItem,
} from '@/onchurch/bulletin/domain/entity/onchurch-bulletin.entity';
import { OnchurchBulletinWriteCommand } from '@/onchurch/bulletin/application/command/onchurch-bulletin-write.command';

function s(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}
function sOrNull(v: unknown): string | null {
  const t = s(v);
  return t || null;
}

export class OnchurchBulletinWriteRequest {
  @IsOptional()
  @MaxLength(32)
  @ApiProperty({ type: String, required: false, description: '템플릿 식별자', example: 'classic' })
  templateId?: string;

  @IsOptional()
  @MaxLength(120)
  @ApiProperty({ type: String, required: false, description: '사용 날짜 (자유 입력)', nullable: true })
  serviceDate: string | null;

  @IsOptional()
  @MaxLength(1000)
  @ApiProperty({ type: String, required: false, description: '교회 위치 이미지 URL', nullable: true })
  locationImageUrl: string | null;

  @IsOptional()
  @MaxLength(60)
  @ApiProperty({ type: String, required: false, description: '주보 호수 (예: 제 1234 호)', nullable: true })
  issueNo: string | null;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '금주의 말씀 본문', nullable: true })
  coverVerse: string | null;

  @IsOptional()
  @MaxLength(120)
  @ApiProperty({ type: String, required: false, description: '금주의 말씀 출처', nullable: true })
  coverVerseRef: string | null;

  @ArrayType()
  @ApiProperty({ type: 'array', required: false, description: '예배 순서 [{no,item,leader}]' })
  worshipOrder?: OnchurchBulletinWorshipOrderItem[];

  @ArrayType()
  @ApiProperty({ type: 'array', required: false, description: '예배 시간 [{name,time,meta}]' })
  worshipServices?: OnchurchBulletinWorshipServiceItem[];

  @ArrayType()
  @ApiProperty({ type: 'array', required: false, description: '섬기는 분들 [{name,role,area}]' })
  staff?: OnchurchBulletinStaffItem[];

  @ArrayType()
  @ApiProperty({ type: 'array', required: false, description: '교회 소식 [{title,content}]' })
  news?: OnchurchBulletinNewsItem[];

  @ArrayType()
  @ApiProperty({ type: 'array', required: false, description: '다음주 봉사위원 [{key,value}]' })
  volunteers?: OnchurchBulletinVolunteerItem[];

  toCommand(): OnchurchBulletinWriteCommand {
    return new OnchurchBulletinWriteCommand({
      templateId: s(this.templateId) || 'classic',
      serviceDate: sOrNull(this.serviceDate),
      locationImageUrl: sOrNull(this.locationImageUrl),
      issueNo: sOrNull(this.issueNo),
      coverVerse: (this.coverVerse ?? '').trim() || null,
      coverVerseRef: sOrNull(this.coverVerseRef),
      worshipOrder: (this.worshipOrder ?? [])
        .map((o) => ({ item: s(o?.item), detail: sOrNull(o?.detail), leader: sOrNull(o?.leader) }))
        .filter((o) => o.item),
      worshipServices: (this.worshipServices ?? [])
        .map((o) => ({ name: s(o?.name), time: s(o?.time), meta: sOrNull(o?.meta) }))
        .filter((o) => o.name || o.time),
      staff: (this.staff ?? [])
        .map((o) => ({ name: s(o?.name), role: sOrNull(o?.role), area: sOrNull(o?.area) }))
        .filter((o) => o.name),
      news: (this.news ?? [])
        .map((o) => ({ title: s(o?.title), content: sOrNull(o?.content) }))
        .filter((o) => o.title || o.content),
      volunteers: (this.volunteers ?? [])
        .map((o) => ({ key: s(o?.key), value: s(o?.value) }))
        .filter((o) => o.key || o.value),
    });
  }
}
