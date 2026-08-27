import { ApiProperty } from '@nestjs/swagger';
import { signOngiMediaUrl } from '@/ongi/common/ongi-media-url';
import { OngiMemberView } from '@/ongi/group/domain/repository/ongi-member.repository.interface';

export class OngiMemberResponse {
  @ApiProperty({ type: String, description: '구성원 id' })
  id: string;

  @ApiProperty({ type: String, description: '그룹 id' })
  groupId: string;

  @ApiProperty({ type: String, description: '이 그룹에서 부르는 이름 (호칭)', example: '엄마' })
  name: string;

  @ApiProperty({ type: String, nullable: true, description: '실명', example: '수진' })
  realName: string | null;

  @ApiProperty({ type: String, description: '역할 (admin | member | pending)' })
  role: string;

  @ApiProperty({ type: Number, description: '이 그룹에서 올린 사진 수' })
  photoCount: number;

  @ApiProperty({ type: String, nullable: true, description: '아바타 이미지 URL' })
  avatarUrl: string | null;

  @ApiProperty({ type: Boolean, description: '내가 이 구성원을 차단했는지' })
  blockedByMe: boolean;

  @ApiProperty({ type: Boolean, description: '내 구성원 레코드인지' })
  isMe: boolean;

  constructor(view: OngiMemberView) {
    this.id = String(view.member.id);
    this.groupId = String(view.member.groupId);
    this.name = view.member.name;
    this.realName = view.realName;
    this.role = view.member.role;
    this.photoCount = view.photoCount;
    this.avatarUrl = signOngiMediaUrl(view.member.avatarUrl);
    this.blockedByMe = view.blockedByMe;
    this.isMe = view.isMe;
  }
}

export class OngiMemberListResponse {
  @ApiProperty({ type: [OngiMemberResponse], description: '그룹 구성원 목록' })
  members: OngiMemberResponse[];

  constructor(views: OngiMemberView[]) {
    this.members = views.map(view => new OngiMemberResponse(view));
  }
}
