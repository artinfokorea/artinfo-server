import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Performance } from '@/performance/performance.entity';
import { PerformanceFetcher } from '@/performance/repository/operation/performance.fetcher';
import { PerformanceCounter } from '@/performance/repository/operation/performance.counter';
import { PerformanceCreator } from '@/performance/repository/operation/performance.creator';
import { PerformanceNotFound } from '@/performance/performance.exception';
import { PerformanceEditor } from '@/performance/repository/operation/performance.editor';

@Injectable()
export class PerformanceRepository {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
  ) {}

  async editOrThrow(editor: PerformanceEditor): Promise<void> {
    const performance = await this.performanceRepository.findOneBy({ id: editor.performanceId, user: { id: editor.userId } });
    if (!performance) throw new PerformanceNotFound();

    await this.performanceRepository.update(
      { id: editor.performanceId, user: { id: editor.userId } },
      {
        title: editor.title,
        introduction: editor.introduction,
        time: editor.time,
        age: editor.age,
        cast: editor.cast,
        ticketPrice: editor.ticketPrice,
        host: editor.host,
        reservationUrl: editor.reservationUrl,
        posterImageUrl: editor.posterImageUrl,
        startAt: editor.startAt,
        endAt: editor.endAt,
        area: editor.area,
        customAreaName: editor.customAreaName,
      },
    );
  }

  async findOneOrThrowById(id: number): Promise<Performance> {
    const performance = await this.performanceRepository.findOne({ relations: ['area', 'user'], where: { id } });
    if (!performance) throw new PerformanceNotFound();

    return performance;
  }

  async deleteOrThrow(userId: number, performanceId: number): Promise<void> {
    const result = await this.performanceRepository.delete({ id: performanceId, user: { id: userId } });
    if (result.affected === 0) throw new PerformanceNotFound();
  }

  async find(fetcher: PerformanceFetcher): Promise<Performance[]> {
    const queryBuilder = this.performanceRepository
      .createQueryBuilder('performance')
      .leftJoinAndSelect('performance.area', 'area')
      .leftJoinAndSelect('area.province', 'province');

    const currentKST = new Date();
    currentKST.setHours(currentKST.getHours() + 9);
    queryBuilder.andWhere('performance.endAt >= :currentKST', { currentKST });

    if (fetcher.keyword) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('LOWER(performance.title) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
            .orWhere('LOWER(performance.customAreaName) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
            .orWhere('LOWER(performance.cast) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
            .orWhere('LOWER(performance.host) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
            .orWhere('LOWER(area.name) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` });
        }),
      );
    }

    if (fetcher.provinceIds.length) {
      queryBuilder.andWhere('province.id IN (:...provinceIds)', { provinceIds: fetcher.provinceIds });
    }

    if (fetcher.categories.length) {
      queryBuilder.andWhere('performance.category IN (:...categories)', { categories: fetcher.categories });
    }

    return await queryBuilder.orderBy('performance.isAd', 'DESC').addOrderBy('performance.endAt', 'ASC').skip(fetcher.skip).take(fetcher.take).getMany();
  }

  async count(counter: PerformanceCounter): Promise<number> {
    const queryBuilder = this.performanceRepository
      .createQueryBuilder('performance')
      .leftJoinAndSelect('performance.area', 'area')
      .leftJoinAndSelect('area.province', 'province');

    if (counter.isPreArranged) {
      const currentKST = new Date();
      currentKST.setHours(currentKST.getHours() + 9);
      queryBuilder.andWhere('performance.endAt > :currentKST', { currentKST });
    }

    if (counter.keyword) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('LOWER(performance.title) LIKE LOWER(:keyword)', { keyword: `%${counter.keyword}%` })
            .orWhere('LOWER(performance.customAreaName) LIKE LOWER(:keyword)', { keyword: `%${counter.keyword}%` })
            .orWhere('LOWER(performance.cast) LIKE LOWER(:keyword)', { keyword: `%${counter.keyword}%` })
            .orWhere('LOWER(performance.host) LIKE LOWER(:keyword)', { keyword: `%${counter.keyword}%` })
            .orWhere('LOWER(area.name) LIKE LOWER(:keyword)', { keyword: `%${counter.keyword}%` });
        }),
      );
    }

    if (counter.provinceIds.length) {
      queryBuilder.andWhere('province.id IN (:...provinceIds)', { provinceIds: counter.provinceIds });
    }

    if (counter.categories.length) {
      queryBuilder.andWhere('performance.category IN (:...categories)', { categories: counter.categories });
    }

    return await queryBuilder.getCount();
  }

  async create(creator: PerformanceCreator): Promise<number> {
    const performance = await this.performanceRepository.save({
      kopisId: creator.kopisId,
      title: creator.title,
      introduction: creator.introduction,
      category: creator.category,
      time: creator.time,
      age: creator.age,
      cast: creator.cast,
      ticketPrice: creator.ticketPrice,
      host: creator.host,
      reservationUrl: creator.reservationUrl,
      posterImageUrl: creator.posterImageUrl,
      startAt: creator.startAt,
      endAt: creator.endAt,
      area: creator.area,
      customAreaName: creator.customAreaName,
      user: creator.user,
    });

    return performance.id;
  }
}
