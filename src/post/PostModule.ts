import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '@/post/PostEntity';
import { PostController } from '@/post/controller/PostController';
import { PostService } from '@/post/service/PostService';
import { PostRepository } from '@/post/repository/PostRepository';
import { UserRepository } from '@/user/repository/user.repository';
import { User } from '@/user/entity/user.entity';
import { LikeRepository } from '@/like/LikeRepository';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, User])],
  controllers: [PostController],
  providers: [PostService, PostRepository, UserRepository, LikeRepository],
})
export class PostModule {}
