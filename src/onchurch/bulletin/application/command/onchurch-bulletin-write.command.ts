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
  worshipOrder: OnchurchBulletinWorshipOrderItem[];
  worshipServices: OnchurchBulletinWorshipServiceItem[];
  staff: OnchurchBulletinStaffItem[];
  news: OnchurchBulletinNewsItem[];
  volunteers: OnchurchBulletinVolunteerItem[];

  constructor(p: {
    templateId: string;
    serviceDate: string | null;
    locationImageUrl: string | null;
    worshipOrder: OnchurchBulletinWorshipOrderItem[];
    worshipServices: OnchurchBulletinWorshipServiceItem[];
    staff: OnchurchBulletinStaffItem[];
    news: OnchurchBulletinNewsItem[];
    volunteers: OnchurchBulletinVolunteerItem[];
  }) {
    this.templateId = p.templateId;
    this.serviceDate = p.serviceDate;
    this.locationImageUrl = p.locationImageUrl;
    this.worshipOrder = p.worshipOrder;
    this.worshipServices = p.worshipServices;
    this.staff = p.staff;
    this.news = p.news;
    this.volunteers = p.volunteers;
  }
}
