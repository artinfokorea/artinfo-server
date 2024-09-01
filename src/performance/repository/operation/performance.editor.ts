import { PerformanceArea } from '@/performance/performance-area.entity';

export class PerformanceEditor {
  userId: number;
  performanceId: number;
  title: string;
  introduction: string;
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

  constructor({
    userId,
    performanceId,
    title,
    introduction,
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
  }: {
    userId: number;
    performanceId: number;
    title: string;
    introduction: string;
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
  }) {
    this.userId = userId;
    this.performanceId = performanceId;
    this.title = title;
    this.introduction = introduction;
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
  }
}
