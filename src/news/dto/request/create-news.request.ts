import { NotBlank } from '@/common/decorator/validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateNewsCommand } from '@/news/dto/command/create-news.command';

export class CreateNewsRequest {
  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '썸네일 이미지 주소', example: 'https://artinfokorea.com' })
  thumbnailImageUrl: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '뉴스 제목', example: '1등입니다' })
  title: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '뉴스 제목', example: '1등?' })
  summary: string;

  @NotBlank()
  @ApiProperty({ type: 'string', required: true, description: '뉴스 제목', example: '1등이니깐 1등입니다' })
  contents: string;

  toCommand() {
    return new CreateNewsCommand({
      thumbnailImageUrl: this.thumbnailImageUrl,
      title: this.title,
      summary: this.summary,
      contents: this.contents,
    });
  }
}
