import { ApiProperty } from '@nestjs/swagger';
import { News } from '@/news/news.entity';

export class NewsResponse {
  @ApiProperty({ type: 'number', required: true, description: '뉴스 아이디', example: 2 })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '뉴스 제목', example: '콩쿨 1등!' })
  title: string;

  @ApiProperty({ type: 'string', required: true, description: '뉴스 내용 요약', example: '1등입니다' })
  summary: string;

  @ApiProperty({ type: 'string', required: true, description: '뉴스 내용', example: '1등이 1등입니다' })
  contents: string;

  @ApiProperty({ type: 'string', required: true, description: '썸네일 이미지 주소', example: 'https://artinfokorea.com' })
  thumbnailImageUrl: string;

  @ApiProperty({ type: 'date', required: true, description: '생성 시간', example: new Date() })
  createdAt: Date;

  constructor(news: News) {
    this.id = news.id;
    this.title = news.title;
    this.summary = news.summary;
    this.contents = news.contents;
    this.thumbnailImageUrl = news.thumbnailImageUrl;
    this.createdAt = news.createdAt;
  }
}
