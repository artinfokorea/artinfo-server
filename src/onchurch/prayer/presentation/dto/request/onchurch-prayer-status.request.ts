import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { OnchurchPrayerStatus } from '@/onchurch/prayer/domain/entity/onchurch-prayer-request.entity';

const STATUSES: OnchurchPrayerStatus[] = ['pending', 'praying', 'answered'];

export class OnchurchPrayerStatusRequest {
  @IsIn(STATUSES)
  @ApiProperty({ enum: STATUSES, required: true, description: '상태' })
  status: OnchurchPrayerStatus;
}
