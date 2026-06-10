import { ApiProperty } from '@nestjs/swagger';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';

export class OnchurchChurchMemberResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) loginId: string;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: String }) phone: string;
  @ApiProperty({ type: String }) role: string;
  @ApiProperty({ type: String, enum: ['owner', 'admin', 'member'] }) churchRole: 'owner' | 'admin' | 'member';
  @ApiProperty({ type: String }) createdAt: string;

  constructor(user: OnchurchUser, churchOwnerId: number | null) {
    this.id = user.id;
    this.loginId = user.loginId;
    this.name = user.name;
    this.phone = user.phone;
    this.role = user.role;
    this.churchRole = user.id === churchOwnerId ? 'owner' : user.role === 'admin' ? 'admin' : 'member';
    this.createdAt = user.createdAt.toISOString();
  }
}

export class OnchurchChurchMemberListResponse {
  @ApiProperty({ type: [OnchurchChurchMemberResponse] })
  members: OnchurchChurchMemberResponse[];
  constructor(users: OnchurchUser[], churchOwnerId: number | null) {
    this.members = users.map((u) => new OnchurchChurchMemberResponse(u, churchOwnerId));
  }
}
