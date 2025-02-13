import { ApiProperty } from '@nestjs/swagger';
import { CommentEntity } from '@/comment/comment.entity';

export class CommentResponse {
  @ApiProperty({ type: 'number', required: true, description: '댓글 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '뉴스 내용', example: '1등이 1등입니다' })
  contents: string;

  @ApiProperty({ type: 'number', required: true, description: '작성자 아이디', example: 5 })
  userId: number;

  @ApiProperty({ type: 'string', required: true, description: '작성자 닉네임', example: 'ARTINFOKOREA' })
  userNickname: string;

  @ApiProperty({ type: 'string', required: false, description: '작성자 아이콘 이미지 주소', example: 'https://artinfokorea.com' })
  userIconImageUrl: string | null;

  @ApiProperty({ type: 'number', required: true, description: '답글 개수', example: 5 })
  childrenCount: number;

  @ApiProperty({ type: 'date', required: true, description: '생성 시간', example: new Date() })
  createdAt: Date;

  constructor(comment: CommentEntity) {
    this.id = comment.id;
    this.contents = comment.contents;
    this.userId = comment.user.id;
    this.userNickname = comment.user.nickname;
    this.userIconImageUrl = comment.user.iconImageUrl;
    this.childrenCount = comment.childrenCount;
    this.createdAt = comment.createdAt;
  }
}
