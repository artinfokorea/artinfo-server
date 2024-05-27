import { ApiProperty } from '@nestjs/swagger';
import { Advertisement } from '@/system/entity/advertisement.entity';

export class AdvertisementResponse {
  @ApiProperty({ type: 'number', required: true, description: '광고 아이디', example: 1 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '광고 제목', example: '아트인포 피아노 콘서트' })
  title: string;

  @ApiProperty({ type: 'string', required: true, description: '광고 이미지 주소', example: 'https://artinfokorea.com' })
  imageUrl: string;

  @ApiProperty({ type: 'string', required: false, description: '광고 타겟 주 소', example: 'https://artinfokorea.com' })
  redirectUrl: string | null;

  constructor(advertisement: Advertisement) {
    this.id = advertisement.id;
    this.title = advertisement.title;
    this.imageUrl = advertisement.imageUrl;
    this.redirectUrl = advertisement.redirectUrl;
  }
}
