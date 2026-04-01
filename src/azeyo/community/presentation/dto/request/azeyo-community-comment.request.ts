import { ApiProperty } from '@nestjs/swagger';
import { NotBlank } from '@/common/decorator/validator';
import { List } from '@/common/type/type';

export class AzeyoCreateCommunityCommentRequest {
  @NotBlank()
  @ApiProperty({ type: Number, required: true, description: '게시글 ID' })
  postId: number;

  @ApiProperty({ type: Number, required: false, description: '부모 댓글 ID (대댓글인 경우)' })
  parentId: number | null;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '댓글 내용' })
  contents: string;
}

export class AzeyoScanCommunityCommentsRequest extends List {
  @ApiProperty({ type: Number, required: false, description: '부모 댓글 ID (대댓글 조회 시)' })
  parentId: number | null = null;
}
