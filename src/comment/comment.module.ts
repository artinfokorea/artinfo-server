import { Module } from '@nestjs/common';
import { CommentController } from '@/comment/comment.controller';
import { CommentService } from '@/comment/comment.service';
import { CommentRepository } from '@/comment/comment.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '@/comment/comment.entity';
import { UserRepository } from '@/user/repository/user.repository';
import { User } from '@/user/entity/user.entity';
import { NewsRepository } from '@/news/repository/news.repository';
import { News } from '@/news/news.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, News])],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository, UserRepository, NewsRepository],
})
export class CommentModule {}
