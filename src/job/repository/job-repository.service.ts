import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { JOB_TYPE, Job } from '@/job/entity/job.entity';
import { Paging } from '@/common/type/type';
import { JobNotFound } from '@/job/exception/job.exception';
import { JobCreator } from '@/job/repository/operation/job.creator';
import { JobEditor } from '@/job/repository/operation/job.editor';

@Injectable()
export class JobRepository {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async create(creator: JobCreator): Promise<number> {
    const job = await this.jobRepository.save({
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

  async editOrThrow(editor: JobEditor) {
    const job = await this.jobRepository.findOneBy({ id: editor.jobId, user: { id: editor.userId } });
    if (!job) throw new JobNotFound();

    await this.jobRepository.update(editor.jobId, {
      title: editor.title,
      companyName: editor.companyName,
      contents: editor.contents,
      province: editor.province,
      address: editor.address,
      fee: editor.fee,
      imageUrl: editor.imageUrl,
    });
  }

  async find(types: JOB_TYPE[], categoryIds: number[], paging: Paging): Promise<Job[]> {
    const where: FindOptionsWhere<Job> = {};

    if (types.length) {
      where.type = In(types);
    }

    if (categoryIds.length) {
      where.jobMajorCategories = { majorCategory: { id: In(categoryIds) } };
    }

    return this.jobRepository.find({
      relations: ['jobMajorCategories.majorCategory'],
      where: where,
      skip: (paging.page - 1) * paging.size,
      take: paging.size,
    });
  }

  async findOneOrThrowById(id: number): Promise<Job> {
    const job = await this.jobRepository.findOneBy({ id });
    if (!job) throw new JobNotFound();

    return job;
  }

  async count(types: JOB_TYPE[], categoryIds: number[]): Promise<number> {
    const where: FindOptionsWhere<Job> = {};

    if (types.length) {
      where.type = In(types);
    }

    if (categoryIds.length) {
      where.jobMajorCategories = { majorCategory: { id: In(categoryIds) } };
    }

    return this.jobRepository.count({
      where: where,
    });
  }

  async deleteOrThrowById(id: number): Promise<void> {
    const job = await this.jobRepository.findOneBy({ id: id });
    if (!job) throw new JobNotFound();

    await job.remove();
  }
}
