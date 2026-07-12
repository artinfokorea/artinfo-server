import { ApiProperty } from '@nestjs/swagger';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';

export class OnchurchUserProfileResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) loginId: string;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: String }) phone: string;
  @ApiProperty({ type: String }) role: string;
  @ApiProperty({ type: String, nullable: true }) churchName: string | null;
  @ApiProperty({ type: Boolean }) mustChangePassword: boolean;

  constructor(user: OnchurchUser) {
    this.id = user.id;
    this.loginId = user.loginId;
    this.name = user.name;
    this.phone = user.phone;
    this.role = user.role;
    this.churchName = user.churchName;
    this.mustChangePassword = user.mustChangePassword;
  }
}
