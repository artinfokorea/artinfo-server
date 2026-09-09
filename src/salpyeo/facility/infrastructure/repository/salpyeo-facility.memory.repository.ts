import { Injectable } from '@nestjs/common';
import { SalpyeoFacility } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { ISalpyeoFacilityRepository, SalpyeoFacilityPatch } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { SalpyeoFacilityNotFound } from '@/salpyeo/facility/domain/exception/salpyeo-facility.exception';
import { SALPYEO_VERTICAL_KEYS, SalpyeoVerticalKey } from '@/salpyeo/facility/domain/constant/salpyeo-vertical.constant';
import { SALPYEO_FACILITY_SEED, SalpyeoFacilitySeed } from '@/salpyeo/facility/domain/constant/salpyeo-facility-seed.constant';

/**
 * 시드 상수를 그대로 들고 있는 메모리 구현.
 * - 컨트롤러/유스케이스 테스트에서 DB 없이 사용
 * - 로컬에서 `SALPYEO_REPOSITORY=memory` 로 띄우면 Postgres 없이 API 확인 가능
 */
@Injectable()
export class SalpyeoFacilityMemoryRepository implements ISalpyeoFacilityRepository {
  private readonly items: SalpyeoFacility[];

  constructor(seed: readonly SalpyeoFacilitySeed[] = SALPYEO_FACILITY_SEED) {
    const now = new Date();
    this.items = seed.map((s, i) => Object.assign(new SalpyeoFacility(), s, { id: i + 1, isActive: true, createdAt: now, updatedAt: now, deletedAt: null }));
  }

  async findByVertical(vertical: SalpyeoVerticalKey): Promise<SalpyeoFacility[]> {
    return this.items.filter(f => f.vertical === vertical && f.isActive).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }

  async findBySlug(slug: string): Promise<SalpyeoFacility | null> {
    return this.items.find(f => f.slug === slug && f.isActive) ?? null;
  }

  async findByVerticalForAdmin(vertical: SalpyeoVerticalKey): Promise<SalpyeoFacility[]> {
    return this.items.filter(f => f.vertical === vertical).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }

  async findBySlugForAdmin(slug: string): Promise<SalpyeoFacility | null> {
    return this.items.find(f => f.slug === slug) ?? null;
  }

  async update(slug: string, patch: SalpyeoFacilityPatch): Promise<SalpyeoFacility> {
    const facility = await this.findBySlugForAdmin(slug);
    if (!facility) throw new SalpyeoFacilityNotFound();

    Object.assign(facility, patch, { updatedAt: new Date() });

    return facility;
  }

  async countByVertical(): Promise<Record<SalpyeoVerticalKey, number>> {
    const counts = Object.fromEntries(SALPYEO_VERTICAL_KEYS.map(k => [k, 0])) as Record<SalpyeoVerticalKey, number>;
    for (const f of this.items) if (f.isActive) counts[f.vertical] += 1;
    return counts;
  }
}
