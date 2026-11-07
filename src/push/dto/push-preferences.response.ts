import { ApiProperty } from '@nestjs/swagger';
import { ArtinfoPushPreferences } from '@/push/artinfo-push.repository';

/**
 * 푸시 수신 설정 응답 본문 — 전역 ResponseInterceptor 가 { code, message, item } 으로 감싸므로
 * 여기엔 item 내용(job)만 둔다. (code/message/item 을 직접 넣으면 두 겹으로 감싸져 앱이 item.job 을 못 읽는다)
 */
export class PushPreferencesResponse {
  @ApiProperty({ type: Boolean, required: true, description: '새 채용 공고 알림', example: true })
  job: boolean;

  constructor(preferences: ArtinfoPushPreferences) {
    this.job = preferences.job;
  }
}
