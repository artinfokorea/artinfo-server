import {
  OnchurchBulletin,
  OnchurchBulletinNewsItem,
  OnchurchBulletinStaffItem,
  OnchurchBulletinVolunteerItem,
  OnchurchBulletinWorshipOrderItem,
  OnchurchBulletinWorshipServiceItem,
} from '@/onchurch/bulletin/domain/entity/onchurch-bulletin.entity';

export const ONCHURCH_BULLETIN_REPOSITORY = Symbol('ONCHURCH_BULLETIN_REPOSITORY');

export interface OnchurchBulletinWriteParams {
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
}

export interface IOnchurchBulletinRepository {
  findByChurchId(churchId: number): Promise<OnchurchBulletin | null>;
  upsertByChurchId(churchId: number, params: OnchurchBulletinWriteParams): Promise<OnchurchBulletin>;
}
