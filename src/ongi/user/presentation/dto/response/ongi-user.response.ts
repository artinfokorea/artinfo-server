import { ApiProperty } from '@nestjs/swagger';
import { OngiUser } from '@/ongi/user/domain/entity/ongi-user.entity';
import { OngiProfileStats } from '@/ongi/user/domain/repository/ongi-user.repository.interface';
import { OngiStorageInfo } from '@/ongi/user/application/usecase/ongi-user.usecase';

export class OngiUserResponse {
  @ApiProperty({ type: String, description: '사용자 id' })
  id: string;

  @ApiProperty({ type: String, description: '이름' })
  name: string;

  @ApiProperty({ type: String, description: 'SNS 로그인 제공자 (kakao | naver | google)' })
  provider: string;

  @ApiProperty({ type: String, nullable: true, description: '프로필 이미지 URL' })
  avatarUrl: string | null;

  constructor(user: OngiUser) {
    this.id = String(user.id);
    this.name = user.name;
    this.provider = user.snsType;
    this.avatarUrl = user.iconImageUrl;
  }
}

export class OngiProfileStatsResponse {
  @ApiProperty({ type: Number, description: '내가 올린 사진 수' })
  photoCount: number;

  @ApiProperty({ type: Number, description: '내 그룹의 앨범 수' })
  albumCount: number;

  @ApiProperty({ type: Number, description: '내가 속한 가족 공간 수' })
  familyCount: number;

  constructor(stats: OngiProfileStats) {
    this.photoCount = stats.photoCount;
    this.albumCount = stats.albumCount;
    this.familyCount = stats.familyCount;
  }
}

export class OngiStorageResponse {
  @ApiProperty({ type: Number, description: '사용 중인 용량 (GB)' })
  usedGb: number;

  @ApiProperty({ type: Number, description: '전체 용량 (GB)' })
  totalGb: number;

  constructor(info: OngiStorageInfo) {
    this.usedGb = info.usedGb;
    this.totalGb = info.totalGb;
  }
}
