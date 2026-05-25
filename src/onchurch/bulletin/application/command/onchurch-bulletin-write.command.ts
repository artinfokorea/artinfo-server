import {
  OnchurchBulletinNewsItem,
  OnchurchBulletinStaffItem,
  OnchurchBulletinVolunteerItem,
  OnchurchBulletinWorshipOrderItem,
  OnchurchBulletinWorshipServiceItem,
} from '@/onchurch/bulletin/domain/entity/onchurch-bulletin.entity';

export class OnchurchBulletinWriteCommand {
  templateId: string;
  serviceDate: string | null;
  locationImageUrl: string | null;
  issueNo: string | null;
  coverVerse: string | null;
  coverVerseRef: string | null;
  worshipOrder: OnchurchBulletinWorshipOrderItem[];
  worshipServices: OnchurchBulletinWorshipServiceItem[];
  staff: OnchurchBulletinStaffItem[];
  news: OnchurchBulletinNewsItem[];
  volunteers: OnchurchBulletinVolunteerItem[];

  constructor(p: {
    templateId: string;
    serviceDate: string | null;
    locationImageUrl: string | null;
    issueNo: string | null;
    coverVerse: string | null;
    coverVerseRef: string | null;
    worshipOrder: OnchurchBulletinWorshipOrderItem[];
    worshipServices: OnchurchBulletinWorshipServiceItem[];
    staff: OnchurchBulletinStaffItem[];
    news: OnchurchBulletinNewsItem[];
    volunteers: OnchurchBulletinVolunteerItem[];
  }) {
    this.templateId = p.templateId;
    this.serviceDate = p.serviceDate;
    this.locationImageUrl = p.locationImageUrl;
    this.issueNo = p.issueNo;
    this.coverVerse = p.coverVerse;
    this.coverVerseRef = p.coverVerseRef;
    this.worshipOrder = p.worshipOrder;
    this.worshipServices = p.worshipServices;
    this.staff = p.staff;
    this.news = p.news;
    this.volunteers = p.volunteers;
  }
}
