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
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { User } from '@/user/entity/user.entity';
import { LessonAreaRepository } from '@/lesson/repository/lesson-area.repository';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import { LessonEvent } from '@/lesson/lesson.event';
import { MajorService } from '@/major/major.service';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { MajorRepository } from '@/major/repository/major.repository';
import { JobMajorCategory } from '@/job/entity/job-major-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, LessonArea, Province, User, MajorCategory, JobMajorCategory])],
  controllers: [LessonController],
  providers: [
    LessonService,
    MajorService,
    UserService,
    MajorRepository,
    LessonRepository,
    UserRepository,
    SchoolRepository,
    RedisRepository,
    ProvinceRepository,
    LessonAreaRepository,
    AwsSesService,
    LessonEvent,
  ],
})
export class LessonModule {}
