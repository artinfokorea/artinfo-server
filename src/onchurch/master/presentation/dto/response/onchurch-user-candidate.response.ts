import { ApiProperty } from '@nestjs/swagger';
import { ONCHURCH_USER_ROLE, OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';

export class OnchurchUserCandidateResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, description: '이름' }) name: string;
  @ApiProperty({ type: String, description: '로그인 아이디' }) loginId: string;
  @ApiProperty({ type: String, description: '연락처' }) phone: string;
  @ApiProperty({ enum: ONCHURCH_USER_ROLE, description: '현재 권한' }) role: ONCHURCH_USER_ROLE;
  @ApiProperty({ type: String, nullable: true, description: '소속 교회명' }) churchName: string | null;

  constructor(user: OnchurchUser) {
    this.id = user.id;
    this.name = user.name;
    this.loginId = user.loginId;
    this.phone = user.phone;
    this.role = user.role;
    this.churchName = user.churchName;
  }
}

export class OnchurchUserCandidateListResponse {
  @ApiProperty({ type: [OnchurchUserCandidateResponse] }) items: OnchurchUserCandidateResponse[];

  constructor(users: OnchurchUser[]) {
    this.items = users.map((u) => new OnchurchUserCandidateResponse(u));
  }
}
