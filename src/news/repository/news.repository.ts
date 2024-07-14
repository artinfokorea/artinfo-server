import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from '@/news/news.entity';
import { Like, Repository } from 'typeorm';
import { NewsNotFound } from '@/news/news.exception';
import { NewsFetcher } from '@/news/repository/opertaion/news.fetcher';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { NewsCounter } from '@/news/repository/opertaion/news.counter';
import { NewsCreator } from '@/news/repository/opertaion/news.creator';
import { NewsEditor } from '@/news/repository/opertaion/news.editor';

@Injectable()
export class NewsRepository {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async findOneOrThrowById(id: number): Promise<News> {
    const news = await this.newsRepository.findOneBy({ id: id });
    if (!news) throw new NewsNotFound();

    return news;
  }

  async create(creator: NewsCreator): Promise<number> {
    const news = await this.newsRepository.save({
      thumbnailImageUrl: creator.thumbnailImageUrl,
      title: creator.title,
      summary: creator.summary,
      contents: creator.contents,
    });

    return news.id;
  }

  async editOrThrow(editor: NewsEditor): Promise<void> {
    const news = await this.newsRepository.findOneBy({ id: editor.newsId });
    if (!news) throw new NewsNotFound();

    await this.newsRepository.update(
      { id: editor.newsId },
      {
        thumbnailImageUrl: editor.thumbnailImageUrl,
        title: editor.title,
        summary: editor.summary,
        contents: editor.contents,
      },
    );
  }

  async find(fetcher: NewsFetcher): Promise<News[]> {
    const where: FindOptionsWhere<News> = {};
    if (fetcher.keyword) {
      where.title = Like(`%${fetcher.keyword}%`);
      where.contents = Like(`%${fetcher.keyword}%`);
    }

    return await this.newsRepository.find({ where: where, skip: fetcher.skip, take: fetcher.take, order: { createdAt: 'DESC' } });
  }

  async count(counter: NewsCounter): Promise<number> {
    const where: FindOptionsWhere<News> = {};
    if (counter.keyword) {
      where.title = Like(`%${counter.keyword}%`);
      where.contents = Like(`%${counter.keyword}%`);
    }

    return this.newsRepository.count({ where: where });
  }

  async deleteOrThrowById(id: number): Promise<void> {
    const news = await this.newsRepository.findOneBy({ id: id });
    if (!news) throw new NewsNotFound();

    await this.newsRepository.delete({ id: id });
  }
}
