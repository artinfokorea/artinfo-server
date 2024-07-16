import { NewsRepository } from '@/news/repository/news.repository';
import { News } from '@/news/news.entity';
import { Injectable } from '@nestjs/common';
import { PagingItems } from '@/common/type/type';
import { GetNewsListCommand } from '@/news/dto/command/get-news-list.command';
import { NewsFetcher } from '@/news/repository/opertaion/news.fetcher';
import { NewsCounter } from '@/news/repository/opertaion/news.counter';
import { CreateNewsCommand } from '@/news/dto/command/create-news.command';
import { NewsCreator } from '@/news/repository/opertaion/news.creator';
import { EditNewsCommand } from '@/news/dto/command/edit-news.command';
import { NewsEditor } from '@/news/repository/opertaion/news.editor';

@Injectable()
export class NewsService {
  constructor(private readonly newsRepository: NewsRepository) {}

  async getNewsById(id: number): Promise<News> {
    return this.newsRepository.findOneOrThrowById(id);
  }

  async getNewsList(command: GetNewsListCommand): Promise<PagingItems<News>> {
    const fetcher = new NewsFetcher({
      keyword: command.keyword,
      paging: command.paging,
    });
    const newsList = await this.newsRepository.find(fetcher);

    const counter = new NewsCounter(command.keyword);
    const totalCount = await this.newsRepository.count(counter);

    return { items: newsList, totalCount: totalCount };
  }

  async countNews() {
    return await this.newsRepository.count({ keyword: null });
  }

  async createNews(command: CreateNewsCommand): Promise<number> {
    const creator = new NewsCreator({
      thumbnailImageUrl: command.thumbnailImageUrl,
      title: command.title,
      summary: command.summary,
      contents: command.contents,
    });

    return this.newsRepository.create(creator);
  }

  async editNews(command: EditNewsCommand): Promise<void> {
    const editor = new NewsEditor({
      newsId: command.newsId,
      thumbnailImageUrl: command.thumbnailImageUrl,
      title: command.title,
      summary: command.summary,
      contents: command.contents,
    });

    await this.newsRepository.editOrThrow(editor);
  }

  async deleteNews(newsId: number): Promise<void> {
    await this.newsRepository.deleteOrThrowById(newsId);
  }
}
