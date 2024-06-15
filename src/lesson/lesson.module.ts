import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { LessonController } from '@/lesson/lesson.controller';
import { LessonService } from '@/lesson/lesson.service';
import { LessonRepository } from '@/lesson/repository/lesson.repository';
import { Province } from '@/lesson/entity/province.entity';
import { LessonArea } from '@/lesson/entity/lesson-area.entity';
import { ProvinceRepository } from '@/province/province.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, LessonArea, Province])],
  controllers: [LessonController],
  providers: [LessonService, LessonRepository, ProvinceRepository],
})
export class LessonModule {}
