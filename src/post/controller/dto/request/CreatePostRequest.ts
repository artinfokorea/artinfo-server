import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';
import { NotBlank } from '@/common/decorator/validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePostServiceDto } from '@/post/service/dto/CreatePostServiceDto';

export class CreatePostRequest {
  @NotBlank()
  @ApiProperty({ enum: PostCategoryEnum, enumName: 'PostCategoryEnum', required: true, description: '글 카테고리', example: PostCategoryEnum.INQUIRY })
  category: PostCategoryEnum;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '글 제목', example: '대학원 질문이요!' })
  title: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '채용 제목', example: '대학원 추천해주세요.' })
  contents: string;

  @ApiProperty({ type: String, required: false, description: '썸네일 이미지 주소', example: 'https://artinfokorea.com' })
  thumbnailImageUrl: string | null;

  toServiceDto(userId: number) {
    return new CreatePostServiceDto({
      userId: userId,
      category: this.category,
      title: this.title,
      contents: this.contents,
      thumbnailImageUrl: this.thumbnailImageUrl,
    });
  }
}
