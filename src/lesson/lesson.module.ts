import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { LessonController } from '@/lesson/lesson.controller';
import { LessonService } from '@/lesson/lesson.service';
import { LessonRepository } from '@/lesson/repository/lesson.repository';
import { Province } from '@/lesson/entity/province.entity';
import { LessonProvince } from '@/lesson/entity/lesson-province.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, LessonProvince, Province])],
  controllers: [LessonController],
  providers: [LessonService, LessonRepository],
})
export class LessonModule {}
