import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { LessonNotFound } from '@/lesson/lesson.exception';
import { LessonFetcher } from '@/lesson/repository/operation/lesson.fetcher';
import { LessonCounter } from '@/lesson/repository/operation/lesson.counter';
import { ProvinceRepository } from '@/province/province.repository';
import { LessonCreator } from '@/lesson/repository/operation/lesson.creator';
import { LessonEditor } from '@/lesson/repository/operation/lesson.editor';

@Injectable()
export class LessonRepository {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,

    private readonly provinceRepository: ProvinceRepository,
  ) {}

  async edit(editor: LessonEditor) {
    await this.lessonRepository.update(
      { id: editor.lessonId },
      {
        imageUrl: editor.imageUrl,
        pay: editor.pay,
        introduction: editor.introduction,
        career: editor.career,
      },
    );
  }

  async remove(lessonId: number) {
    await this.lessonRepository.delete({ id: lessonId });
  }

  async create(command: LessonCreator): Promise<number> {
    const lesson = await this.lessonRepository.save({
      imageUrl: command.imageUrl,
      pay: command.pay,
      introduction: command.introduction,
      career: command.career,
      user: { id: command.userId },
    });

    return lesson.id;
  }

  async findOneOrThrowById(id: number): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      relations: ['user.schools', 'user.userMajorCategories.majorCategory', 'areas'],
      where: { id },
    });
    if (!lesson) throw new LessonNotFound();

    return lesson;
  }

  async find(fetcher: LessonFetcher): Promise<Lesson[]> {
    const queryBuilder = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.user', 'user')
      .leftJoinAndSelect('user.schools', 'schools')
      .leftJoinAndSelect('user.userMajorCategories', 'userMajorCategories')
      .leftJoinAndSelect('userMajorCategories.majorCategory', 'majorCategory')
      .leftJoinAndSelect('lesson.areas', 'areas');

    if (fetcher.keyword) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.orWhere('user.name LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('majorCategory.koName LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('majorCategory.enName LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('schools.name LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('areas.name LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('lesson.introduction LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('lesson.career LIKE :keyword', { keyword: `%${fetcher.keyword}%` });
        }),
      );
    }

    if (fetcher.provinceIds.length) {
      const provinces = await this.provinceRepository.findByIds(fetcher.provinceIds);
      const provinceNames = provinces.map(province => province.name);

      queryBuilder.andWhere(
        new Brackets(qb => {
          provinceNames.forEach(provinceName => {
            qb.orWhere('areas.name LIKE :name', { name: `%${provinceName}%` });
          });
        }),
      );
    }

    if (fetcher.professionalFields.length) {
      queryBuilder.andWhere('majorCategory.secondGroupEn IN (:...professionalFields)', { professionalFields: fetcher.professionalFields });
    }

    return queryBuilder.skip(fetcher.skip).take(fetcher.take).getMany();
  }

  async count(counter: LessonCounter): Promise<number> {
    const queryBuilder = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.user', 'user')
      .leftJoinAndSelect('user.schools', 'schools')
      .leftJoinAndSelect('user.userMajorCategories', 'userMajorCategories')
      .leftJoinAndSelect('userMajorCategories.majorCategory', 'majorCategory')
      .leftJoinAndSelect('lesson.areas', 'areas');

    if (counter.keyword) {
      queryBuilder
        .where('user.name LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('majorCategory.koName LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('majorCategory.enName LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('schools.name LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('areas.name LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('lesson.introduction LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('lesson.career LIKE :keyword', { keyword: `%${counter.keyword}%` });
    }

    if (counter.provinceIds.length) {
      const provinces = await this.provinceRepository.findByIds(counter.provinceIds);
      const provinceNames = provinces.map(province => province.name);

      queryBuilder.andWhere(
        new Brackets(qb => {
          provinceNames.forEach(provinceName => {
            qb.orWhere('areas.name LIKE :name', { name: `%${provinceName}%` });
          });
        }),
      );
    }

    if (counter.professionalFields.length) {
      queryBuilder.andWhere('majorCategory.secondGroupEn IN (:...professionalFields)', { professionalFields: counter.professionalFields });
    }

    return queryBuilder.getCount();
  }
}
