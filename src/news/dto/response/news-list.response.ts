import { ApiProperty } from '@nestjs/swagger';
import { News } from '@/news/news.entity';
import { NewsResponse } from '@/news/dto/response/news.response';

export class NewsListResponse {
  @ApiProperty({ type: [NewsResponse], required: true, description: '뉴스 목록' })
  news: NewsResponse[];

  @ApiProperty({ type: 'number', required: true, description: '총 개수', example: 5 })
  totalCount: number;

  constructor({ newsList, totalCount }: { newsList: News[]; totalCount: number }) {
    this.news = newsList.map(news => new NewsResponse(news));
    this.totalCount = totalCount;
  }
}
