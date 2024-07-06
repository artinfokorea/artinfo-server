import { Injectable } from '@nestjs/common';
import { LessonRepository } from '@/lesson/repository/lesson.repository';
import { GetLessonsCommand } from '@/lesson/dto/command/get-lessons.command';
import { LessonFetcher } from '@/lesson/repository/operation/lesson.fetcher';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { CountLessonsCommand } from '@/lesson/dto/command/count-lessons.command';
import { LessonCounter } from '@/lesson/repository/operation/lesson.counter';
import { UserService } from '@/user/service/user.service';
import { UserNotFound } from '@/user/exception/user.exception';
import { CreateLessonCommand } from '@/lesson/dto/command/create-lesson.command';
import { LessonCreator } from '@/lesson/repository/operation/lesson.creator';
import { LessonAreaCreator } from '@/lesson/repository/operation/lesson-area.creator';
import { LessonAreaRepository } from '@/lesson/repository/lesson-area.repository';
import { AlreadyLessonExists, LessonNotFound, UserDoesNotQualify } from '@/lesson/lesson.exception';
import { EditLessonCommand } from '@/lesson/dto/command/edit-lesson.command';
import { LessonEditor } from '@/lesson/repository/operation/lesson.editor';

@Injectable()
export class LessonService {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly lessonAreaRepository: LessonAreaRepository,
    private readonly userService: UserService,
  ) {}

  async editLesson(command: EditLessonCommand) {
    const user = await this.userService.getUserById(command.userId);
    if (!user.lesson) throw new LessonNotFound();

    const editor = new LessonEditor({
      lessonId: user.lesson.id,
      imageUrl: command.imageUrl,
      pay: command.pay,
      introduction: command.introduction,
      career: command.career,
    });

    await this.lessonRepository.editOrThrow(editor);

    await this.lessonAreaRepository.remove(user.lesson.id);
    const lessonAreaCreator = new LessonAreaCreator({
      lessonId: user.lesson.id,
      names: command.areaNames,
    });
    await this.lessonAreaRepository.createMany(lessonAreaCreator);
  }

  async removeLesson(userId: number) {
    const user = await this.userService.getUserById(userId);
    await this.lessonRepository.deleteOrThrowById(user.lesson.id);
  }

  async create(command: CreateLessonCommand): Promise<number> {
    await this.checkQualification(command.userId);

    const lessonCreator = new LessonCreator({
      userId: command.userId,
      imageUrl: command.imageUrl,
      pay: command.pay,
      introduction: command.introduction,
      career: command.career,
    });

    const lessonId = await this.lessonRepository.create(lessonCreator);

    const lessonAreaCreator = new LessonAreaCreator({
      lessonId: lessonId,
      names: command.areaNames,
    });

    await this.lessonAreaRepository.createMany(lessonAreaCreator);

    return lessonId;
  }

  async checkQualification(userId: number) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UserNotFound();

    if (user.lesson) throw new AlreadyLessonExists();

    const cases: string[] = [];
    if (!user.userMajorCategories.length) cases.push('전공');
    if (!user.schools.length) cases.push('학력');
    if (!user.phone) cases.push('연락처');

    if (cases.length) throw new UserDoesNotQualify(cases);
  }

  getLessonById(id: number): Promise<Lesson> {
    return this.lessonRepository.findOneOrThrowById(id);
  }

  getLessons(command: GetLessonsCommand): Promise<Lesson[]> {
    const fetcher = new LessonFetcher({
      keyword: command.keyword,
      professionalFields: command.professionalFields,
      provinceIds: command.provinceIds,
      paging: command.paging,
    });

    return this.lessonRepository.find(fetcher);
  }

  countLessons(command: CountLessonsCommand): Promise<number> {
    const counter = new LessonCounter({
      keyword: command.keyword,
      provinceIds: command.provinceIds,
      professionalFields: command.professionalFields,
    });

    return this.lessonRepository.count(counter);
  }
}
