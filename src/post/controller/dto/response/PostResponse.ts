import { ApiProperty } from '@nestjs/swagger';
import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';
import { PostEntity } from '@/post/PostEntity';

export class PostResponse {
  @ApiProperty({ type: Number, required: true, description: '글 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: Number, required: true, description: '작성자 아이디', example: 2 })
  authorId: number;

  @ApiProperty({ type: String, required: true, description: '작성자 이름', example: 2 })
  authorName: string;

  @ApiProperty({ type: String, required: false, description: '작성자 아이콘 이미지 주소', example: 'https://artinfokorea.com' })
  authorIconImageUrl: string | null;

  @ApiProperty({ enum: PostCategoryEnum, enumName: 'PostCategoryEnum', required: true, description: '게시글 카테고리', example: PostCategoryEnum.INQUIRY })
  category: PostCategoryEnum;

  @ApiProperty({ type: String, required: true, description: '게시글 제목', example: '대학원 질문있습니다.' })
  title: string;

  @ApiProperty({ type: String, required: true, description: '게시글 내용', example: '대학원 추천해주세요.' })
  contents: string;

  @ApiProperty({ type: String, required: false, description: '게시글 썸네일 주소', example: 'https://artinfokorea.com' })
  thumbnailImageUrl: string | null;

  @ApiProperty({ type: Number, required: true, description: '조회수', example: 5 })
  viewCount: number;

  @ApiProperty({ type: Number, required: true, description: '좋아요 수', example: 5 })
  likeCount: number;

  @ApiProperty({ type: Number, required: true, description: '댓글 수', example: 5 })
  commentCount: number;

  @ApiProperty({ type: Boolean, required: true, description: '좋아요 여부', example: 5 })
  isLiked: boolean;

  @ApiProperty({ type: Date, required: true, description: '작성일', example: new Date() })
  createdAt: Date;

  constructor(post: PostEntity) {
    this.id = post.id;
    this.authorId = post.user.id;
    this.authorName = post.user.nickname;
    this.authorIconImageUrl = post.user.iconImageUrl;
    this.category = post.category;
    this.title = post.title;
    this.contents = post.contents;
    this.thumbnailImageUrl = post.thumbnailImageUrl;
    this.viewCount = post.viewCount;
    this.likeCount = post.likes ? post.likes.length : post.likesCount;
    this.commentCount = post.comments ? post.comments.length : post.commentsCount;
    this.isLiked = post.isLiked;
    this.createdAt = post.createdAt;
  }
}
