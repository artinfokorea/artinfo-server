import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { ISalpyeoFacilityRepository, SalpyeoFacilityPatch } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { SalpyeoFacilityNotFound } from '@/salpyeo/facility/domain/exception/salpyeo-facility.exception';
import { SALPYEO_IMAGE_BUCKET } from '@/salpyeo/facility/infrastructure/service/salpyeo-image-fetch';
import { SALPYEO_VERTICAL_KEYS, SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';

@Injectable()
export class SalpyeoFacilityRepository implements ISalpyeoFacilityRepository {
  constructor(
    @InjectRepository(SalpyeoFacility)
    private readonly repo: Repository<SalpyeoFacility>,
  ) {}

  async findByVertical(vertical: SalpyeoVerticalKey): Promise<SalpyeoFacility[]> {
    return this.repo.find({ where: { vertical, isActive: true }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findBySlug(slug: string): Promise<SalpyeoFacility | null> {
    return this.repo.findOne({ where: { slug, isActive: true } });
  }

  async findByVerticalForAdmin(vertical: SalpyeoVerticalKey): Promise<SalpyeoFacility[]> {
    return this.repo.find({ where: { vertical }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findBySlugForAdmin(slug: string): Promise<SalpyeoFacility | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async update(slug: string, patch: SalpyeoFacilityPatch): Promise<SalpyeoFacility> {
    const facility = await this.findBySlugForAdmin(slug);
    if (!facility) throw new SalpyeoFacilityNotFound();

    await this.repo.update({ slug }, patch);

    const updated = await this.findBySlugForAdmin(slug);
    if (!updated) throw new SalpyeoFacilityNotFound();

    return updated;
  }

  /** images JSONB 안에 우리 버킷이 아닌 url 이 하나라도 있는 시설 */
  private externalImageCondition(alias: string): string {
    return `EXISTS (SELECT 1 FROM jsonb_array_elements(${alias}.images) AS img WHERE img->>'url' NOT LIKE '%' || :bucket || '.s3.%')`;
  }

  async findWithExternalImages(limit: number): Promise<SalpyeoFacility[]> {
    return this.repo
      .createQueryBuilder('f')
      .where(this.externalImageCondition('f'), { bucket: SALPYEO_IMAGE_BUCKET })
      .orderBy('f.slug', 'ASC')
      .limit(limit)
      .getMany();
  }

  async countWithExternalImages(): Promise<number> {
    return this.repo.createQueryBuilder('f').where(this.externalImageCondition('f'), { bucket: SALPYEO_IMAGE_BUCKET }).getCount();
  }

  async countByVertical(): Promise<Record<SalpyeoVerticalKey, number>> {
    const rows: { vertical: SalpyeoVerticalKey; count: string }[] = await this.repo
      .createQueryBuilder('f')
      .select('f.vertical', 'vertical')
      .addSelect('COUNT(*)', 'count')
      .where('f.is_active = true AND f.deleted_at IS NULL')
      .groupBy('f.vertical')
      .getRawMany();

    const counts = Object.fromEntries(SALPYEO_VERTICAL_KEYS.map(k => [k, 0])) as Record<SalpyeoVerticalKey, number>;
    for (const row of rows) counts[row.vertical] = Number(row.count);
    return counts;
  }
}
