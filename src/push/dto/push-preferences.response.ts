import { ApiProperty } from '@nestjs/swagger';
import { ArtinfoPushPreferences } from '@/push/artinfo-push.repository';

class PushPreferencesItem {
  @ApiProperty({ type: Boolean, required: true, description: '새 채용 공고 알림', example: true })
  job: boolean;
}

export class PushPreferencesResponse {
  @ApiProperty({ type: 'string', required: true, description: '응답 코드', example: 'OK' })
  code: string = 'OK';

  @ApiProperty({ type: 'null', required: false, description: '응답 메세지', example: null })
  message: null = null;

  @ApiProperty({ type: PushPreferencesItem, required: true, description: '응답 아이템' })
  item: PushPreferencesItem;

  constructor(preferences: ArtinfoPushPreferences) {
    this.item = { job: preferences.job };
  }
}
