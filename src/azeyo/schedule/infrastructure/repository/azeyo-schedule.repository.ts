import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoSchedule } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';
import { IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AzeyoScheduleNotFound } from '@/azeyo/schedule/domain/exception/azeyo-schedule.exception';

@Injectable()
export class AzeyoScheduleRepository implements IAzeyoScheduleRepository {
  constructor(
    @InjectRepository(AzeyoSchedule)
    private readonly repository: Repository<AzeyoSchedule>,
  ) {}

  async create(schedule: Partial<AzeyoSchedule>): Promise<AzeyoSchedule> {
    const entity = this.repository.create(schedule);
    return this.repository.save(entity);
  }

  async findOneByIdAndUserIdOrThrow(id: number, userId: number): Promise<AzeyoSchedule> {
    const schedule = await this.repository.findOneBy({ id, userId });
    if (!schedule) throw new AzeyoScheduleNotFound();
    return schedule;
  }

  async findManyByUserId(userId: number): Promise<AzeyoSchedule[]> {
    return this.repository.find({
      where: { userId },
      order: { date: 'ASC' },
    });
  }

  async softRemove(schedule: AzeyoSchedule): Promise<void> {
    await this.repository.softRemove(schedule);
  }
}
