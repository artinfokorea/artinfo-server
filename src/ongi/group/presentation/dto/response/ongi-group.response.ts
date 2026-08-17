import { ApiProperty } from '@nestjs/swagger';
import { OngiGroupSummary } from '@/ongi/group/domain/repository/ongi-group.repository.interface';

export class OngiGroupResponse {
  @ApiProperty({ type: String, description: '그룹 id' })
  id: string;

  @ApiProperty({ type: String, description: '가족 공간 이름' })
  name: string;

  @ApiProperty({ type: String, description: '초대 코드', example: 'ONGI-A2B3' })
  inviteCode: string;

  @ApiProperty({ type: Number, description: '초대 코드 만료까지 남은 일수' })
  inviteExpiresInDays: number;

  @ApiProperty({ type: Number, description: '구성원 수' })
  memberCount: number;

  @ApiProperty({ type: Number, description: '사진 수' })
  photoCount: number;

  @ApiProperty({ type: String, description: '시작 시점 표시 문구', example: '2026년 8월부터' })
  sinceLabel: string;

  constructor(summary: OngiGroupSummary) {
    const { group } = summary;
    const createdAt = new Date(group.createdAt);

    this.id = String(group.id);
    this.name = group.name;
    this.inviteCode = group.inviteCode;
    this.inviteExpiresInDays = Math.max(0, Math.ceil((new Date(group.inviteExpiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    this.memberCount = summary.memberCount;
    this.photoCount = summary.photoCount;
    this.sinceLabel = `${createdAt.getFullYear()}년 ${createdAt.getMonth() + 1}월부터`;
  }
}

export class OngiGroupListResponse {
  @ApiProperty({ type: [OngiGroupResponse], description: '내가 속한 가족 공간 목록' })
  groups: OngiGroupResponse[];

  constructor(summaries: OngiGroupSummary[]) {
    this.groups = summaries.map(summary => new OngiGroupResponse(summary));
  }
}
