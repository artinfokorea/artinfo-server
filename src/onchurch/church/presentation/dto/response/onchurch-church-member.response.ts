import { ApiProperty } from '@nestjs/swagger';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';

export class OnchurchChurchMemberResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) loginId: string;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: String }) phone: string;
  @ApiProperty({ type: String }) role: string;
  @ApiProperty({ type: String }) createdAt: string;

  constructor(user: OnchurchUser) {
    this.id = user.id;
    this.loginId = user.loginId;
    this.name = user.name;
    this.phone = user.phone;
    this.role = user.role;
    this.createdAt = user.createdAt.toISOString();
  }
}

export class OnchurchChurchMemberListResponse {
  @ApiProperty({ type: [OnchurchChurchMemberResponse] })
  members: OnchurchChurchMemberResponse[];
  constructor(users: OnchurchUser[]) {
    this.members = users.map((u) => new OnchurchChurchMemberResponse(u));
  }
}
