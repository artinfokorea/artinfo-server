import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Performance } from '@/performance/performance.entity';
import { PerformanceFetcher } from '@/performance/repository/operation/performance.fetcher';
import { PerformanceCounter } from '@/performance/repository/operation/performance.counter';
import { PerformanceCreator } from '@/performance/repository/operation/performance.creator';
import { PerformanceNotFound } from '@/performance/performance.exception';

@Injectable()
export class PerformanceRepository {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
  ) {}

  async findOneOrThrowById(id: number): Promise<Performance> {
    const performance = await this.performanceRepository.findOne({ relations: ['area'], where: { id } });
    if (!performance) throw new PerformanceNotFound();

    return performance;
  }

  async find(fetcher: PerformanceFetcher): Promise<Performance[]> {
    const queryBuilder = this.performanceRepository
      .createQueryBuilder('performance')
      .leftJoinAndSelect('performance.area', 'area')
      .leftJoinAndSelect('area.province', 'province');

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

    return await queryBuilder.orderBy('performance.startAt', 'ASC').skip(fetcher.skip).take(fetcher.take).getMany();
  }

  async count(counter: PerformanceCounter): Promise<number> {
    const queryBuilder = this.performanceRepository
      .createQueryBuilder('performance')
      .leftJoinAndSelect('performance.area', 'area')
      .leftJoinAndSelect('area.province', 'province');

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
    });

    return performance.id;
  }
}
