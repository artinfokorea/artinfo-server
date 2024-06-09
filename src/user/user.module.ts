import { Module } from '@nestjs/common';
import { UserController } from '@/user/controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entity/user.entity';
import { UserService } from '@/user/service/user.service';
import { UserRepository } from '@/user/repository/user.repository';
import { UserMajorCategoryEntity } from '@/user/entity/user-major-category.entity';
import { School } from '@/user/entity/school.entity';
import { SchoolRepository } from '@/user/repository/school.repository';
import { RedisService } from '@/common/redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, School, UserMajorCategoryEntity])],
  controllers: [UserController],
  providers: [UserService, UserRepository, SchoolRepository, RedisService],
})
export class UserModule {}
