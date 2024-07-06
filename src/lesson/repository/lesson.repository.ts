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
import { Util } from '@/common/util/util';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LessonRepository {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,

    private readonly redisService: RedisRepository,
    private eventEmitter: EventEmitter2,
    private readonly provinceRepository: ProvinceRepository,
  ) {}

  async editOrThrow(editor: LessonEditor) {
    const lesson = await this.lessonRepository.findOneBy({ id: editor.lessonId });
    if (!lesson) throw new LessonNotFound();

    await this.lessonRepository.update(
      { id: editor.lessonId },
      {
        imageUrl: editor.imageUrl,
        pay: editor.pay,
        introduction: editor.introduction,
        career: editor.career,
      },
    );

    await this.redisService.deleteByPattern('lessons:*');
  }

  async deleteOrThrowById(lessonId: number) {
    const lesson = await this.lessonRepository.findOneBy({ id: lessonId });
    if (!lesson) throw new LessonNotFound();

    await lesson.remove();
    await this.redisService.deleteByPattern('lessons:*');
  }

  async create(command: LessonCreator): Promise<number> {
    const lesson = await this.lessonRepository.save({
      imageUrl: command.imageUrl,
      pay: command.pay,
      introduction: command.introduction,
      career: command.career,
      user: { id: command.userId },
    });

    await this.redisService.deleteByPattern('lessons:*');

    return lesson.id;
  }

  async findOneOrThrowById(id: number): Promise<Lesson> {
    const redisKey = new Util().getRedisKey('lessons:single:', id);
    const lesson = await this.redisService.getByKey(redisKey);

    if (lesson) {
      return lesson as Lesson;
    } else {
      const lesson = await this.lessonRepository.findOne({
        relations: ['user.schools', 'user.userMajorCategories.majorCategory', 'areas'],
        where: { id },
      });
      if (!lesson) throw new LessonNotFound();

      this.eventEmitter.emit('lesson.fetched', redisKey, lesson);
      return lesson;
    }
  }

  async find(fetcher: LessonFetcher): Promise<Lesson[]> {
    const redisKey = new Util().getRedisKey('lessons:list:', fetcher);

    const redisLessons = await this.redisService.getByKey(redisKey);
    if (redisLessons) {
      return redisLessons as Lesson[];
    } else {
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
            provinceNames.forEach((provinceName, idx) => {
              qb.orWhere('areas.name LIKE :name' + idx, { ['name' + idx]: `%${provinceName}%` });
            });
          }),
        );
      }

      if (fetcher.professionalFields.length) {
        queryBuilder.andWhere('majorCategory.secondGroupEn IN (:...professionalFields)', { professionalFields: fetcher.professionalFields });
      }

      queryBuilder.orderBy({ 'lesson.id': 'DESC' });

      const lessons = await queryBuilder.skip(fetcher.skip).take(fetcher.take).getMany();

      this.eventEmitter.emit('lessons.fetched', redisKey, lessons);

      return lessons;
    }
  }

  async count(counter: LessonCounter): Promise<number> {
    const redisKey = new Util().getRedisKey('lessons:count:', counter);
    const redisTotalCount = await this.redisService.getByKey(redisKey);

    if (redisTotalCount !== null) {
      return redisTotalCount as number;
    } else {
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
            provinceNames.forEach((provinceName, idx) => {
              qb.orWhere('areas.name LIKE :name' + idx, { ['name' + idx]: `%${provinceName}%` });
            });
          }),
        );
      }

      if (counter.professionalFields.length) {
        queryBuilder.andWhere('majorCategory.secondGroupEn IN (:...professionalFields)', { professionalFields: counter.professionalFields });
      }

      const totalCount = await queryBuilder.getCount();
      this.eventEmitter.emit('lessons-count.fetched', redisKey, totalCount);

      return totalCount;
    }
  }
}
