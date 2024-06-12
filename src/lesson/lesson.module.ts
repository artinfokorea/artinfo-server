import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { LessonController } from '@/lesson/lesson.controller';
import { LessonService } from '@/lesson/lesson.service';
import { LessonRepository } from '@/lesson/repository/lesson.repository';
import { Province } from '@/lesson/entity/province.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Province])],
  controllers: [LessonController],
  providers: [LessonService, LessonRepository],
})
export class LessonModule {}
