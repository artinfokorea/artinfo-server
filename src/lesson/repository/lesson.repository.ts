import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { LessonNotFound } from '@/lesson/lesson.exception';
import { LessonFetcher } from '@/lesson/repository/operation/lesson.fetcher';
import { LessonCounter } from '@/lesson/repository/operation/lesson.counter';
import { ProvinceRepository } from '@/province/province.repository';

@Injectable()
export class LessonRepository {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,

    private readonly provinceRepository: ProvinceRepository,
  ) {}

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
            .orWhere('schools.name LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('areas.name LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('lesson.introduction LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
            .orWhere('lesson.career LIKE :keyword', { keyword: `%${fetcher.keyword}%` });
        }),
      );
    }

    if (fetcher.provinceIds) {
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

    if (fetcher.majorIds) {
      queryBuilder.andWhere('userMajorCategories.major_category_id IN (:...majorIds)', { majorIds: fetcher.majorIds });
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
        .orWhere('schools.name LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('areas.name LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('lesson.introduction LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('lesson.career LIKE :keyword', { keyword: `%${counter.keyword}%` });
    }

    if (counter.provinceIds) {
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

    if (counter.majorIds) {
      queryBuilder.andWhere('userMajorCategories.major_category_id IN (:...majorIds)', { majorIds: counter.majorIds });
    }

    return queryBuilder.getCount();
  }
}
