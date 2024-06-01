import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { FULL_TIME_JOB_TYPE, FullTimeJob } from '@/job/entity/full-time-job.entity';
import { Paging } from '@/common/type/type';
import { JobNotFound } from '@/job/exception/job.exception';
import { FullTimeJobCreator } from '@/job/repository/operation/full-time-job.creator';
import { FullTimeJobEditor } from '@/job/repository/operation/full-time-job.editor';

@Injectable()
export class FullTimeJobRepository {
  constructor(
    @InjectRepository(FullTimeJob)
    private fullTimeJobRepository: Repository<FullTimeJob>,
  ) {}

  async create(creator: FullTimeJobCreator): Promise<number> {
    const job = await this.fullTimeJobRepository.save({
      user: { id: creator.userId },
      type: creator.type,
      title: creator.title,
      companyName: creator.companyName,
      contents: creator.contents,
      province: creator.province,
      address: creator.address,
      fee: creator.fee,
      imageUrl: creator.imageUrl,
    });

    return job.id;
  }

  async editOrThrow(editor: FullTimeJobEditor) {
    const job = await this.fullTimeJobRepository.findOneBy({ id: editor.jobId, user: { id: editor.userId } });
    if (!job) throw new JobNotFound();

    await this.fullTimeJobRepository.update(editor.jobId, {
      title: editor.title,
      companyName: editor.companyName,
      contents: editor.contents,
      province: editor.province,
      address: editor.address,
      fee: editor.fee,
      imageUrl: editor.imageUrl,
    });
  }

  async find(type: FULL_TIME_JOB_TYPE, categoryIds: number[], paging: Paging): Promise<FullTimeJob[]> {
    const where: FindOptionsWhere<FullTimeJob> = { type: type };

    if (categoryIds.length) {
      where.fullTimeJobMajorCategories = { majorCategory: { id: In(categoryIds) } };
    }

    return this.fullTimeJobRepository.find({
      relations: ['fullTimeJobMajorCategories.majorCategory'],
      where: { type: type },
      skip: (paging.page - 1) * paging.size,
      take: paging.size,
    });
  }

  async findOneOrThrowById(id: number): Promise<FullTimeJob> {
    const job = await this.fullTimeJobRepository.findOneBy({ id });
    if (!job) throw new JobNotFound();

    return job;
  }

  async count(type: FULL_TIME_JOB_TYPE, categoryIds: number[]): Promise<number> {
    const queryBuilder = this.fullTimeJobRepository
      .createQueryBuilder('job')
      .leftJoin('job.fullTimeJobMajorCategories', 'jobMajorCategory')
      .where('job.type = :type', { type });

    if (categoryIds.length) {
      queryBuilder.andWhere('jobMajorCategory.majorCategoryId IN (:...categoryIds)', { categoryIds });
    }

    return queryBuilder.getCount();
  }

  async deleteOrThrowById(id: number): Promise<void> {
    const job = await this.fullTimeJobRepository.findOneBy({ id: id });
    if (!job) throw new JobNotFound();
    await job.remove();
  }
}
