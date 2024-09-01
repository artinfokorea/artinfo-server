import { PerformanceArea } from '@/performance/performance-area.entity';
import { PerformanceEditor } from '@/performance/repository/operation/performance.editor';

export class EditPerformanceCommand {
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
  areaId: number | null;
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
    areaId,
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
    areaId: number | null;
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
    this.areaId = areaId;
    this.customAreaName = customAreaName;
  }

  toEditor(area: PerformanceArea | null) {
    return new PerformanceEditor({
      userId: this.userId,
      performanceId: this.performanceId,
      title: this.title,
      introduction: this.introduction,
      time: this.time,
      age: this.age,
      cast: this.cast,
      ticketPrice: this.ticketPrice,
      host: this.host,
      reservationUrl: this.reservationUrl,
      posterImageUrl: this.posterImageUrl,
      startAt: this.startAt,
      endAt: this.endAt,
      area: area,
      customAreaName: this.customAreaName,
    });
  }
}
