import { Module } from '@nestjs/common';
import { NewsController } from '@/news/news.controller';
import { NewsService } from '@/news/news.service';
import { NewsRepository } from '@/news/repository/news.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from '@/news/news.entity';

@Module({
  imports: [TypeOrmModule.forFeature([News])],
  controllers: [NewsController],
  providers: [NewsService, NewsRepository],
})
export class NewsModule {}
