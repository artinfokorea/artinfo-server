import { ApiProperty } from '@nestjs/swagger';
import { OnchurchFoundLoginId } from '@/onchurch/auth/application/usecase/onchurch-find-login-ids.usecase';

export class OnchurchFoundLoginIdItem {
  @ApiProperty({ type: String, required: true, description: '아이디', example: 'test01' })
  loginId: string;

  @ApiProperty({ type: String, required: true, description: '회원 이름', example: '홍길동' })
  name: string;

  @ApiProperty({ type: 'date', required: true, description: '가입 일시' })
  createdAt: Date;

  constructor(item: OnchurchFoundLoginId) {
    this.loginId = item.loginId;
    this.name = item.name;
    this.createdAt = item.createdAt;
  }
}

export class OnchurchFindLoginIdsResponse {
  @ApiProperty({ type: [OnchurchFoundLoginIdItem], required: true, description: '해당 연락처로 가입된 아이디 목록' })
  accounts: OnchurchFoundLoginIdItem[];

  constructor(items: OnchurchFoundLoginId[]) {
    this.accounts = items.map((item) => new OnchurchFoundLoginIdItem(item));
  }
}
