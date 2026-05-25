import { ApiProperty } from '@nestjs/swagger';
import {
  OnchurchBulletin,
  OnchurchBulletinNewsItem,
  OnchurchBulletinStaffItem,
  OnchurchBulletinVolunteerItem,
  OnchurchBulletinWorshipOrderItem,
  OnchurchBulletinWorshipServiceItem,
} from '@/onchurch/bulletin/domain/entity/onchurch-bulletin.entity';

export class OnchurchBulletinResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) templateId: string;
  @ApiProperty({ type: String, nullable: true }) serviceDate: string | null;
  @ApiProperty({ type: String, nullable: true }) locationImageUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) issueNo: string | null;
  @ApiProperty({ type: String, nullable: true }) coverVerse: string | null;
  @ApiProperty({ type: String, nullable: true }) coverVerseRef: string | null;
  @ApiProperty({ type: 'array' }) worshipOrder: OnchurchBulletinWorshipOrderItem[];
  @ApiProperty({ type: 'array' }) worshipServices: OnchurchBulletinWorshipServiceItem[];
  @ApiProperty({ type: 'array' }) staff: OnchurchBulletinStaffItem[];
  @ApiProperty({ type: 'array' }) news: OnchurchBulletinNewsItem[];
  @ApiProperty({ type: 'array' }) volunteers: OnchurchBulletinVolunteerItem[];

  constructor(b: OnchurchBulletin) {
    this.id = b.id;
    this.templateId = b.templateId;
    this.serviceDate = b.serviceDate;
    this.locationImageUrl = b.locationImageUrl;
    this.issueNo = b.issueNo;
    this.coverVerse = b.coverVerse;
    this.coverVerseRef = b.coverVerseRef;
    this.worshipOrder = b.worshipOrder ?? [];
    this.worshipServices = b.worshipServices ?? [];
    this.staff = b.staff ?? [];
    this.news = b.news ?? [];
    this.volunteers = b.volunteers ?? [];
  }
}

export class OnchurchMyBulletinResponse {
  @ApiProperty({ type: OnchurchBulletinResponse, nullable: true })
  bulletin: OnchurchBulletinResponse | null;
  constructor(b: OnchurchBulletin | null) {
    this.bulletin = b ? new OnchurchBulletinResponse(b) : null;
  }
}
