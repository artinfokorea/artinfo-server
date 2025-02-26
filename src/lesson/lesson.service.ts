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
import {
  AlreadyLessonExists,
  ApplicantUserDoesNotRegisterPhone,
  LessonNotFound,
  TeacherUserPhoneNotFound,
  UserDoesNotQualify,
} from '@/lesson/lesson.exception';
import { EditLessonCommand } from '@/lesson/dto/command/edit-lesson.command';
import { LessonEditor } from '@/lesson/repository/operation/lesson.editor';
import { MajorService } from '@/major/major.service';
import { PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';
import { SystemService } from '@/system/service/system.service';
import { ApplyLessonCommand } from '@/lesson/dto/command/ApplyLessonCommand';
import { UserRepository } from '@/user/repository/user.repository';
import { LessonApplicationRepository } from '@/lesson/repository/LessonApplicationRepository';

@Injectable()
export class LessonService {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly lessonApplicationRepository: LessonApplicationRepository,
    private readonly lessonAreaRepository: LessonAreaRepository,
    private readonly majorService: MajorService,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly systemService: SystemService,
  ) {}

  async getLessFields() {
    return this.majorService.getMajorFields([PROFESSIONAL_FIELD_CATEGORY.ADMINISTRATION]);
  }

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

  async applyLesson(command: ApplyLessonCommand) {
    const applicant = await this.userRepository.findOneOrThrowById(command.applicantId);
    if (!applicant.phone) throw new ApplicantUserDoesNotRegisterPhone();

    const teacher = await this.userRepository.findOneOrThrowById(command.teacherId);
    if (!teacher.phone) throw new TeacherUserPhoneNotFound();

    const contents = `${command.contents}\n\n${applicant.name} ${applicant.phone}`;

    await this.systemService.sendSMS(teacher.phone, contents);

    await this.lessonApplicationRepository.save({
      applicantId: applicant.id,
      teacherId: teacher.id,
      contents: command.contents,
    });
  }
}
