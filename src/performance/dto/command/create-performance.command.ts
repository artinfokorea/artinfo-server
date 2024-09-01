import { PERFORMANCE_CATEGORY } from '@/performance/performance.entity';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { PerformanceCreator } from '@/performance/repository/operation/performance.creator';
import { User } from '@/user/entity/user.entity';

export class CreatePerformanceCommand {
  userId: number;
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
  areaId: number | null;
  customAreaName: string | null;

  constructor({
    userId,
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
    areaId,
    customAreaName,
  }: {
    userId: number;
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
    areaId: number | null;
    customAreaName: string | null;
  }) {
    this.userId = userId;
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
    this.areaId = areaId;
    this.customAreaName = customAreaName;
  }

  toCreator(user: User, performanceArea: PerformanceArea | null) {
    return new PerformanceCreator({
      kopisId: null,
      title: this.title,
      introduction: this.introduction,
      category: this.category,
      time: this.time,
      age: this.age,
      cast: this.cast,
      ticketPrice: this.ticketPrice,
      host: this.host,
      reservationUrl: this.reservationUrl,
      posterImageUrl: this.posterImageUrl,
      startAt: this.startAt,
      endAt: this.endAt,
      area: performanceArea,
      customAreaName: this.customAreaName,
      user: user,
    });
  }
}
