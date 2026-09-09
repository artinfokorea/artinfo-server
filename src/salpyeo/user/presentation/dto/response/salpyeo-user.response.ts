import { ApiProperty } from '@nestjs/swagger';
import { SalpyeoUser } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';

export class SalpyeoUserResponse {
  @ApiProperty({ type: String, description: '사용자 id' })
  id: string;

  @ApiProperty({ type: String, description: '이름' })
  name: string;

  @ApiProperty({ type: String, description: 'SNS 로그인 제공자 (google)' })
  provider: string;

  @ApiProperty({ type: String, nullable: true, description: '이메일 (구글이 주지 않으면 null)' })
  email: string | null;

  @ApiProperty({ type: String, nullable: true, description: '프로필 이미지 URL' })
  avatarUrl: string | null;

  constructor(user: SalpyeoUser) {
    this.id = String(user.id);
    this.name = user.name;
    this.provider = user.snsType;
    this.email = user.email;
    this.avatarUrl = user.iconImageUrl;
  }
}
