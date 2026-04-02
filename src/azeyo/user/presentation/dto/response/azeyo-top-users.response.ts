import { ApiProperty } from '@nestjs/swagger';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

export class AzeyoTopUserResponse {
  @ApiProperty() id: number;
  @ApiProperty() nickname: string;
  @ApiProperty() iconImageUrl: string | null;
  @ApiProperty() activityPoints: number;
  @ApiProperty() monthlyPoints: number;

  constructor(user: AzeyoUser) {
    this.id = user.id;
    this.nickname = user.nickname;
    this.iconImageUrl = user.iconImageUrl;
    this.activityPoints = user.activityPoints;
    this.monthlyPoints = user.monthlyPoints;
  }
}

export class AzeyoTopUsersResponse {
  @ApiProperty({ type: [AzeyoTopUserResponse] }) users: AzeyoTopUserResponse[];

  constructor(users: AzeyoUser[]) {
    this.users = users.map(u => new AzeyoTopUserResponse(u));
  }
}
