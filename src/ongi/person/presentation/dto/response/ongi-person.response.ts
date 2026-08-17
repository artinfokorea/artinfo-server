import { ApiProperty } from '@nestjs/swagger';
import { OngiPersonView } from '@/ongi/person/domain/repository/ongi-person.repository.interface';

export class OngiPersonResponse {
  @ApiProperty({ type: String, description: '인물 id' })
  id: string;

  @ApiProperty({ type: String, description: '그룹 id' })
  groupId: string;

  @ApiProperty({ type: String, description: '이름' })
  name: string;

  @ApiProperty({ type: Number, description: '태그된 사진 수' })
  photoCount: number;

  @ApiProperty({ type: String, nullable: true, description: '대표 이미지 URL' })
  imageUrl: string | null;

  constructor(view: OngiPersonView) {
    this.id = String(view.person.id);
    this.groupId = String(view.person.groupId);
    this.name = view.person.name;
    this.photoCount = view.photoCount;
    this.imageUrl = view.person.imageUrl;
  }
}

export class OngiPersonListResponse {
  @ApiProperty({ type: [OngiPersonResponse], description: '그룹의 인물 목록' })
  people: OngiPersonResponse[];

  constructor(views: OngiPersonView[]) {
    this.people = views.map(view => new OngiPersonResponse(view));
  }
}
