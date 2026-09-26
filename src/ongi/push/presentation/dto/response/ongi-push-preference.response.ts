import { ApiProperty } from '@nestjs/swagger';
import { OngiPushPreferences } from '@/ongi/push/domain/service/ongi-push-preference';

export class OngiPushPreferencesResponse {
  @ApiProperty({ type: Boolean, description: '새 사진·영상 알림' })
  photo: boolean;

  @ApiProperty({ type: Boolean, description: '한마디(댓글) 알림' })
  comment: boolean;

  @ApiProperty({ type: Boolean, description: '좋아요 알림' })
  like: boolean;

  @ApiProperty({ type: Boolean, description: '일정 등록·변경·리마인더 알림' })
  event: boolean;

  @ApiProperty({ type: Boolean, description: '가족 소식(새 구성원 참여) 알림' })
  family: boolean;

  constructor(preferences: OngiPushPreferences) {
    this.photo = preferences.photo;
    this.comment = preferences.comment;
    this.like = preferences.like;
    this.event = preferences.event;
    this.family = preferences.family;
  }
}
