import { ApiProperty } from '@nestjs/swagger';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

export class AzeyoPublicUserProfileResponse {
  @ApiProperty() id: number;
  @ApiProperty() nickname: string;
  @ApiProperty() subtitle: string | null;
  @ApiProperty() iconImageUrl: string | null;
  @ApiProperty() activityPoints: number;
  @ApiProperty() monthlyPoints: number;
  @ApiProperty() postsCount: number;
  @ApiProperty() likesCount: number;

  constructor(user: AzeyoUser) {
    this.id = user.id;
    this.nickname = user.nickname;
    this.subtitle = user.subtitle;
    this.iconImageUrl = user.iconImageUrl;
    this.activityPoints = user.activityPoints;
    this.monthlyPoints = user.monthlyPoints;
    this.postsCount = user.postsCount;
    this.likesCount = user.likesCount;
  }
}
