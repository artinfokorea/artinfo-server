import { ApiProperty } from '@nestjs/swagger';
import { EditPerformanceCommand } from '@/performance/dto/command/edit-performance.command';

export class EditPerformanceRequest {
  @ApiProperty({ type: 'string', required: true, description: '공연 제목', example: '수정 국립합창단 제 126회 정기연주회' })
  title: string;

  @ApiProperty({ type: 'string', required: true, description: '공연 포스터 이미지 주소', example: 'https://edit.artinfokorea.com' })
  posterImageUrl: string;

  @ApiProperty({ type: 'date', required: true, description: '공연 시작일', example: '2024-01-01' })
  startAt: Date;

  @ApiProperty({ type: 'date', required: true, description: '공연 종료일', example: '2024-01-01' })
  endAt: Date;

  @ApiProperty({ type: 'string | null', required: false, description: '직접 입력한 공연 장소', example: '수정 예술의 전당 콘서트홀' })
  customAreaName: string | null;

  @ApiProperty({ type: 'number | null', required: false, description: '공연장 아디', example: 14163 })
  areaId: number | null;

  @ApiProperty({ type: 'string', required: true, description: '공연시간', example: '수정 일요일(17:00)' })
  time: string;

  @ApiProperty({ type: 'string', required: true, description: '관람연령', example: '수정 만 7세 이상' })
  age: string;

  @ApiProperty({ type: 'string', required: true, description: '티켓 가격', example: '수정 R석 110,000원 / S석 90,000원' })
  ticketPrice: string;

  @ApiProperty({ type: 'string', required: true, description: '출연진', example: '수정 손열음' })
  cast: string;

  @ApiProperty({ type: 'string', required: true, description: '주관 / 주최', example: '수정 (주)파이플랜즈' })
  host: string;

  @ApiProperty({ type: 'string', required: false, description: '예매 주소', example: 'https://edit.artinfokorea.com' })
  reservationUrl: string | null;

  @ApiProperty({ type: 'string', required: true, description: '공연 소개(내용)', example: '수정 좋아요' })
  introduction: string;

  toCommand(userId: number, performanceId: number) {
    return new EditPerformanceCommand({
      userId: userId,
      performanceId: performanceId,
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
      areaId: this.areaId,
      customAreaName: this.customAreaName,
    });
  }
}
