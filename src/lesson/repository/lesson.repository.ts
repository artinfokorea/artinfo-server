import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { LessonNotFound } from '@/lesson/lesson.exception';
import { LessonFetcher } from '@/lesson/repository/operation/lesson.fetcher';
import { LessonCounter } from '@/lesson/repository/operation/lesson.counter';

@Injectable()
export class LessonRepository {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  async findOneOrThrowById(id: number): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      relations: ['user.schools', 'user.userMajorCategories.majorCategory', 'provinces'],
      where: { id },
    });
    if (!lesson) throw new LessonNotFound();

    return lesson;
  }

  find(fetcher: LessonFetcher): Promise<Lesson[]> {
    const queryBuilder = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.user', 'user')
      .leftJoinAndSelect('user.schools', 'schools')
      .leftJoinAndSelect('user.userMajorCategories', 'userMajorCategories')
      .leftJoinAndSelect('userMajorCategories.majorCategory', 'majorCategory')
      .leftJoinAndSelect('lesson.provinces', 'provinces');

    if (fetcher.keyword) {
      queryBuilder
        .where('user.name LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
        .orWhere('majorCategory.koName LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
        .orWhere('schools.name LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
        .orWhere('provinces.name LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
        .orWhere('lesson.introduction LIKE :keyword', { keyword: `%${fetcher.keyword}%` })
        .orWhere('lesson.career LIKE :keyword', { keyword: `%${fetcher.keyword}%` });
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
      .leftJoinAndSelect('lesson.provinces', 'provinces');

    if (counter.keyword) {
      queryBuilder
        .where('user.name LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('majorCategory.koName LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('schools.name LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('provinces.name LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('lesson.introduction LIKE :keyword', { keyword: `%${counter.keyword}%` })
        .orWhere('lesson.career LIKE :keyword', { keyword: `%${counter.keyword}%` });
    }

    return queryBuilder.getCount();
  }
}
