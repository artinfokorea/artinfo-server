import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { LessonController } from '@/lesson/lesson.controller';
import { LessonService } from '@/lesson/lesson.service';
import { LessonRepository } from '@/lesson/repository/lesson.repository';
import { Province } from '@/lesson/entity/province.entity';
import { LessonArea } from '@/lesson/entity/lesson-area.entity';
import { ProvinceRepository } from '@/province/province.repository';
import { UserService } from '@/user/service/user.service';
import { UserRepository } from '@/user/repository/user.repository';
import { SchoolRepository } from '@/user/repository/school.repository';
import { RedisService } from '@/common/redis/redis.service';
import { User } from '@/user/entity/user.entity';
import { LessonAreaRepository } from '@/lesson/repository/lesson-area.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, LessonArea, Province, User])],
  controllers: [LessonController],
  providers: [LessonService, UserService, LessonRepository, UserRepository, SchoolRepository, RedisService, ProvinceRepository, LessonAreaRepository],
})
export class LessonModule {}
