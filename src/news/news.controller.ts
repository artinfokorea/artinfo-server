import { RestApiController, RestApiDelete, RestApiGet, RestApiPost, RestApiPut } from '@/common/decorator/rest-api';
import { NewsResponse } from '@/news/dto/response/news.response';
import { NewsService } from '@/news/news.service';
import { Body, Param, Query } from '@nestjs/common';
import { NewsListResponse } from '@/news/dto/response/news-list.response';
import { GetNewsListRequest } from '@/news/dto/request/get-news-list.request';
import { CreateResponse } from '@/common/response/createResponse';
import { USER_TYPE } from '@/user/entity/user.entity';
import { CreateNewsRequest } from '@/news/dto/request/create-news.request';
import { OkResponse } from '@/common/response/ok.response';
import { EditNewsRequest } from '@/news/dto/request/edit-news.request';
import { CountJobsResponse } from '@/job/dto/response/count-jobs.response';
import { CountNewsResponse } from '@/news/dto/response/count-news.response';

@RestApiController('/news', 'News')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @RestApiGet(CountNewsResponse, { path: '/count', description: '뉴스 개수 조회' })
  async countNews(): Promise<CountJobsResponse> {
    const totalCount = await this.newsService.countNews();
    return new CountNewsResponse(totalCount);
  }

  @RestApiGet(NewsResponse, { path: '/:newsId', description: '뉴스 단건 조회' })
  async getNews(@Param('newsId') newsId: number) {
    const news = await this.newsService.getNewsById(newsId);

    return new NewsResponse(news);
  }

  @RestApiGet(NewsListResponse, { path: '/', description: '뉴스 목록 조회' })
  async getNewsList(@Query() request: GetNewsListRequest) {
    const { items: newsList, totalCount } = await this.newsService.getNewsList(request.toCommand());

    return new NewsListResponse({ newsList: newsList, totalCount: totalCount });
  }

  @RestApiPost(CreateResponse, { path: '/', description: '뉴스 생성', auth: [USER_TYPE.ADMIN] })
  async createNews(@Body() request: CreateNewsRequest): Promise<CreateResponse> {
    const newsId = await this.newsService.createNews(request.toCommand());

    return new CreateResponse(newsId);
  }

  @RestApiPut(OkResponse, { path: '/:newsId', description: '뉴스 수정', auth: [USER_TYPE.ADMIN] })
  async editNews(@Param('newsId') newsId: number, @Body() request: EditNewsRequest): Promise<OkResponse> {
    await this.newsService.editNews(request.toCommand(newsId));

    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/:newsId', description: '뉴스 삭제', auth: [USER_TYPE.ADMIN] })
  async deleteNews(@Param('newsId') newsId: number): Promise<OkResponse> {
    await this.newsService.deleteNews(newsId);

    return new OkResponse();
  }
}
