import { ApiProperty } from '@nestjs/swagger';
import { Performance } from '@/performance/performance.entity';
import { PerformanceAreaDetailResponse } from '@/performance/dto/response/performance-area-detail.response';

export class PerformanceDetailResponse {
  @ApiProperty({ type: 'number', required: true, description: '공연 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: 'number', required: true, description: '작성자 아이디', example: 2 })
  authorId: number;

  @ApiProperty({ type: 'string', required: true, description: '공연 제목', example: '국립합창단 제 126회 정기연주회' })
  title: string;

  @ApiProperty({ type: 'string', required: true, description: '공연 포스터 이미지 주소', example: 'https://artinfokorea.com' })
  posterImageUrl: string;

  @ApiProperty({ type: 'date', required: true, description: '공연 시작일', example: new Date() })
  startAt: Date;

  @ApiProperty({ type: 'date', required: true, description: '공연 종료일', example: new Date() })
  endAt: Date;

  @ApiProperty({ type: 'string | null', required: false, description: '직접 입력한 공연 장소', example: '예술의 전당 콘서트홀' })
  customAreaName: string | null;

  @ApiProperty({ type: PerformanceAreaDetailResponse, required: false, description: '공연장 정보' })
  area: PerformanceAreaDetailResponse | null;

  @ApiProperty({ type: 'string', required: true, description: '공연시간', example: '일요일(17:00)' })
  time: string;

  @ApiProperty({ type: 'string', required: true, description: '관람연령', example: '만 7세 이상' })
  age: string;

  @ApiProperty({ type: 'string', required: true, description: '티켓 가격', example: 'R석 110,000원 / S석 90,000원' })
  ticketPrice: string;

  @ApiProperty({ type: 'string', required: true, description: '출연진', example: '손열음' })
  cast: string;

  @ApiProperty({ type: 'string', required: true, description: '주관 / 주최', example: '(주)파이플랜즈' })
  host: string;

  @ApiProperty({ type: 'string', required: false, description: '예매 주소', example: 'https://artinfokorea.com' })
  reservationUrl: string | null;

  @ApiProperty({ type: 'string', required: true, description: '공연 소개(내용)', example: '좋아요' })
  introduction: string;

  constructor(performance: Performance) {
    let area: PerformanceAreaDetailResponse | null = null;
    if (performance.area) area = new PerformanceAreaDetailResponse(performance.area);

    this.id = performance.id;
    this.authorId = performance.user.id;
    this.title = performance.title;
    this.posterImageUrl = performance.posterImageUrl;
    this.startAt = performance.startAt;
    this.endAt = performance.endAt;
    this.customAreaName = performance.customAreaName;
    this.area = area;
    this.time = performance.time;
    this.age = performance.age;
    this.ticketPrice = performance.ticketPrice;
    this.cast = performance.cast;
    this.host = performance.host;
    this.reservationUrl = performance.reservationUrl;
    this.introduction = performance.introduction;
  }
}
