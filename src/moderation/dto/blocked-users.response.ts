import { ApiProperty } from '@nestjs/swagger';

/**
 * 차단한 회원 목록 응답 본문 — 전역 ResponseInterceptor 가 { code, message, item } 으로 감싸므로
 * 여기엔 item 내용(userIds)만 둔다.
 */
export class BlockedUsersResponse {
  @ApiProperty({ type: [Number], required: true, description: '내가 차단한 회원 아이디 목록', example: [12, 34] })
  userIds: number[];

  constructor(userIds: number[]) {
    this.userIds = userIds;
  }
}
