import { PERFORMANCE_CATEGORY } from '@/performance/performance.entity';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { User } from '@/user/entity/user.entity';

export class PerformanceCreator {
  kopisId: string | null;
  title: string;
  introduction: string;
  category: PERFORMANCE_CATEGORY;
  time: string;
  age: string;
  cast: string;
  ticketPrice: string;
  host: string;
  reservationUrl: string | null;
  posterImageUrl: string;
  startAt: Date;
  endAt: Date;
  area: PerformanceArea | null;
  customAreaName: string | null;
  user: User;

  constructor({
    kopisId,
    title,
    introduction,
    category,
    time,
    age,
    cast,
    ticketPrice,
    host,
    reservationUrl,
    posterImageUrl,
    startAt,
    endAt,
    area,
    customAreaName,
    user,
  }: {
    kopisId: string | null;
    title: string;
    introduction: string;
    category: PERFORMANCE_CATEGORY;
    time: string;
    age: string;
    cast: string;
    ticketPrice: string;
    host: string;
    reservationUrl: string | null;
    posterImageUrl: string;
    startAt: Date;
    endAt: Date;
    area: PerformanceArea | null;
    customAreaName: string | null;
    user: User;
  }) {
    this.kopisId = kopisId;
    this.title = title;
    this.introduction = introduction;
    this.category = category;
    this.time = time;
    this.age = age;
    this.cast = cast;
    this.ticketPrice = ticketPrice;
    this.host = host;
    this.reservationUrl = reservationUrl;
    this.posterImageUrl = posterImageUrl;
    this.startAt = startAt;
    this.endAt = endAt;
    this.area = area;
    this.customAreaName = customAreaName;
    this.user = user;
  }
}
