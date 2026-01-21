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
import { SystemService } from '@/system/service/system.service';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { ImageRepository } from '@/system/repository/image.repository';
import { ImageEntity } from '@/system/entity/image.entity';
import { LessonApplicationRepository } from '@/lesson/repository/LessonApplicationRepository';
import { Auth } from '@/auth/entity/auth.entity';
import { AuthRepository } from '@/auth/repository/auth.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Lesson, LessonArea, Province, User, MajorCategory, JobMajorCategory, ImageEntity, Auth])],
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
    LessonApplicationRepository,
    UserRepository,
    ImageRepository,
    SystemService,
    AwsS3Service,
    AwsSesService,
    LessonEvent,
    AuthRepository,
    JwtService,
  ],
})
export class LessonModule {}
