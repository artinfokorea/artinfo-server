import { Injectable } from '@nestjs/common';
import { LessonRepository } from '@/lesson/repository/lesson.repository';
import { GetLessonsCommand } from '@/lesson/dto/command/get-lessons.command';
import { LessonFetcher } from '@/lesson/repository/operation/lesson.fetcher';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { CountLessonsCommand } from '@/lesson/dto/command/count-lessons.command';
import { LessonCounter } from '@/lesson/repository/operation/lesson.counter';

@Injectable()
export class LessonService {
  constructor(private readonly lessonRepository: LessonRepository) {}

  getLessonById(id: number): Promise<Lesson> {
    return this.lessonRepository.findOneOrThrowById(id);
  }

  getLessons(command: GetLessonsCommand): Promise<Lesson[]> {
    const fetcher = new LessonFetcher({
      keyword: command.keyword,
      majorIds: command.majorIds,
      provinceIds: command.provinceIds,
      paging: command.paging,
    });

    return this.lessonRepository.find(fetcher);
  }

  countLessons(command: CountLessonsCommand): Promise<number> {
    const counter = new LessonCounter({
      keyword: command.keyword,
      provinceIds: command.provinceIds,
      majorIds: command.majorIds,
    });

    return this.lessonRepository.count(counter);
  }
}
