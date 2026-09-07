import { ApiProperty } from '@nestjs/swagger';
import { OngiHoliday } from '@/ongi/event/domain/service/ongi-holiday';

export class OngiHolidayResponse {
  @ApiProperty({ type: String, description: '양력 날짜 YYYY-MM-DD' })
  date: string;

  @ApiProperty({ type: String, description: '공휴일 이름' })
  name: string;

  constructor(holiday: OngiHoliday) {
    this.date = holiday.date;
    this.name = holiday.name;
  }
}

export class OngiHolidayListResponse {
  @ApiProperty({ type: [OngiHolidayResponse], description: '공휴일 목록 (날짜순)' })
  holidays: OngiHolidayResponse[];

  constructor(holidays: OngiHoliday[]) {
    this.holidays = holidays.map(holiday => new OngiHolidayResponse(holiday));
  }
}
