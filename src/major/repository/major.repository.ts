import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MajorCategory, PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';
import { JobMajorCategory } from '@/job/entity/job-major-category.entity';
import { MajorNotFound } from '@/job/exception/job.exception';
import { MajorGroupPayload } from '@/major/repository/payload/major-group.payload';

@Injectable()
export class MajorRepository {
  constructor(
    @InjectRepository(MajorCategory)
    private majorCategoryRepository: Repository<MajorCategory>,

    @InjectRepository(JobMajorCategory)
    private fullTimeJobMajorCategoryRepository: Repository<JobMajorCategory>,
  ) {}

  async deleteByJobId(jobId: number): Promise<void> {
    await this.fullTimeJobMajorCategoryRepository.delete({ jobId: jobId });
  }

  async createJobMajorCategoriesOrThrow(jobId: number, majorCategoryIds: number[]): Promise<void> {
    const majorCategories = await this.majorCategoryRepository.findBy({ id: In(majorCategoryIds) });
    if (majorCategories.length !== majorCategoryIds.length) throw new MajorNotFound();

    const uniqueMajorCategoryIds = new Set<number>();
    majorCategoryIds.forEach(majorCategoryId => uniqueMajorCategoryIds.add(majorCategoryId));

    const FullTimeJobMajorCategories = [...uniqueMajorCategoryIds].map(majorCategoryId => {
      return this.fullTimeJobMajorCategoryRepository.create({ jobId: jobId, majorCategoryId: majorCategoryId });
    });

    await this.fullTimeJobMajorCategoryRepository.save(FullTimeJobMajorCategories);
  }

  findAll() {
    return this.majorCategoryRepository.find({ order: { fieldSequence: 'ASC', majorSequence: 'ASC' } });
  }

  async findMajorArt(): Promise<MajorGroupPayload[]> {
    const qb = this.majorCategoryRepository.createQueryBuilder('majorCategory').select('DISTINCT majorCategory.firstGroupEn, majorCategory.firstGroupKo');
    const groups: { first_group_ko: string; first_group_en: string }[] = await qb.getRawMany();

    return groups.map(group => new MajorGroupPayload({ nameKo: group.first_group_ko, nameEn: group.first_group_en }));
  }

  async findMajorFields(excludeFields: PROFESSIONAL_FIELD_CATEGORY[]): Promise<MajorGroupPayload[]> {
    const qb = this.majorCategoryRepository
      .createQueryBuilder('majorCategory') //
      .select('DISTINCT majorCategory.secondGroupEn, majorCategory.secondGroupKo, field_sequence');

    if (excludeFields.length) {
      qb.where('majorCategory.secondGroupEn NOT IN (:...categories)', { categories: excludeFields });
    }

    qb.orderBy('field_sequence', 'ASC');

    const groups: { second_group_ko: string; second_group_en: string }[] = await qb.getRawMany();

    return groups.map(group => new MajorGroupPayload({ nameKo: group.second_group_ko, nameEn: group.second_group_en }));
  }

  async findMajorGroups() {
    const qb = this.majorCategoryRepository
      .createQueryBuilder('majorCategory') //
      .select('DISTINCT majorCategory.thirdGroupEn, majorCategory.thirdGroupKo,  field_sequence')
      .where('majorCategory.thirdGroupEn IS NOT NULL')
      .orderBy('field_sequence', 'ASC');

    const groups: { third_group_ko: string; third_group_en: string }[] = await qb.getRawMany();

    return groups.map(group => new MajorGroupPayload({ nameKo: group.third_group_ko, nameEn: group.third_group_en }));
  }
}
