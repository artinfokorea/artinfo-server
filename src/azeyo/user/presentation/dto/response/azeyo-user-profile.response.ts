import { ApiProperty } from '@nestjs/swagger';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

export class AzeyoUserProfileResponse {
  @ApiProperty() id: number;
  @ApiProperty() name: string | null;
  @ApiProperty() nickname: string;
  @ApiProperty() subtitle: string | null;
  @ApiProperty() iconImageUrl: string | null;
  @ApiProperty() email: string | null;
  @ApiProperty() phone: string | null;
  @ApiProperty() marriageDate: string | null;
  @ApiProperty() children: string;
  @ApiProperty() gender: string | null;
  @ApiProperty() birthDate: string | null;
  @ApiProperty() activityPoints: number;
  @ApiProperty() monthlyPoints: number;
  @ApiProperty() postsCount: number;
  @ApiProperty() likesCount: number;
  @ApiProperty() jokboCount: number;
  @ApiProperty() isWriteBanned: boolean;
  @ApiProperty() createdAt: Date;

  constructor(user: AzeyoUser) {
    this.id = user.id;
    this.name = user.name;
    this.nickname = user.nickname;
    this.subtitle = user.subtitle;
    this.iconImageUrl = user.iconImageUrl;
    this.email = user.email;
    this.phone = user.phone;
    this.marriageDate = user.marriageDate;
    this.children = user.children;
    this.gender = user.gender;
    this.birthDate = user.birthDate;
    this.activityPoints = user.activityPoints;
    this.monthlyPoints = user.monthlyPoints;
    this.postsCount = user.postsCount;
    this.likesCount = user.likesCount;
    this.jokboCount = user.jokboCount;
    this.isWriteBanned = user.isWriteBanned ?? false;
    this.createdAt = user.createdAt;
  }
}
