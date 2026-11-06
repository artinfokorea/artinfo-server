import { ApiProperty } from '@nestjs/swagger';

class BlockedUsersItem {
  @ApiProperty({ type: [Number], required: true, description: '내가 차단한 회원 ID 목록', example: [9, 12] })
  userIds: number[];
}

export class BlockedUsersResponse {
  @ApiProperty({ type: 'string', required: true, description: '응답 코드', example: 'OK' })
  code: string = 'OK';

  @ApiProperty({ type: 'null', required: false, description: '응답 메세지', example: null })
  message: null = null;

  @ApiProperty({ type: BlockedUsersItem, required: true, description: '응답 아이템' })
  item: BlockedUsersItem;

  constructor(userIds: number[]) {
    this.item = { userIds };
  }
}
