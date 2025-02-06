import { ApiProperty } from '@nestjs/swagger';
import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';
import { PostEntity } from '@/post/PostEntity';

export class PostResponse {
  @ApiProperty({ type: Number, required: true, description: '작성자 아이디', example: 2 })
  authorId: number;

  @ApiProperty({ type: String, required: true, description: '작성자 이름', example: 2 })
  authorName: string;

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

  @ApiProperty({ type: Boolean, required: true, description: '좋아요 여부', example: 5 })
  isLiked: boolean;

  constructor(post: PostEntity) {
    this.authorId = post.user.id;
    this.authorName = post.user.name;
    this.category = post.category;
    this.title = post.title;
    this.contents = post.contents;
    this.thumbnailImageUrl = post.thumbnailImageUrl;
    this.viewCount = post.viewCount;
    this.likeCount = post.likeCount;
    this.isLiked = post.isLiked;
  }
}
