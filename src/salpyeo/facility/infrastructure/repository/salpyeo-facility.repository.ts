import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { ISalpyeoFacilityRepository } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
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
