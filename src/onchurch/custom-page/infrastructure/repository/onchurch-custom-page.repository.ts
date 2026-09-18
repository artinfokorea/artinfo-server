import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import {
  IOnchurchCustomPageRepository,
  OnchurchCustomPageWriteParams,
} from '@/onchurch/custom-page/domain/repository/onchurch-custom-page.repository.interface';
import { OnchurchCustomPage } from '@/onchurch/custom-page/domain/entity/onchurch-custom-page.entity';
import { OnchurchCustomPageNotFound } from '@/onchurch/custom-page/domain/exception/onchurch-custom-page.exception';

@Injectable()
export class OnchurchCustomPageRepository implements IOnchurchCustomPageRepository {
  constructor(
    @InjectRepository(OnchurchCustomPage)
    private readonly pageRepository: Repository<OnchurchCustomPage>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchCustomPage[]> {
    return this.pageRepository.find({ where: { churchId }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findActiveByChurchId(churchId: number): Promise<OnchurchCustomPage[]> {
    return this.pageRepository.find({ where: { churchId, isActive: true }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findActiveBySlug(churchId: number, slug: string): Promise<OnchurchCustomPage | null> {
    return this.pageRepository.findOneBy({ churchId, slug, isActive: true });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchCustomPage | null> {
    return this.pageRepository.findOneBy({ churchId, id });
  }

  async existsBySlug(churchId: number, slug: string, exceptId?: number): Promise<boolean> {
    const count = await this.pageRepository.count({
      where: exceptId ? { churchId, slug, id: Not(exceptId) } : { churchId, slug },
    });
    return count > 0;
  }

  async create(churchId: number, params: OnchurchCustomPageWriteParams): Promise<OnchurchCustomPage> {
    const sortOrder = await this.nextSortOrder(churchId);
    return this.pageRepository.save({ churchId, sortOrder, ...params });
  }

  // 새 페이지는 항상 목록 맨 끝에 붙인다.
  private async nextSortOrder(churchId: number): Promise<number> {
    const row = await this.pageRepository
      .createQueryBuilder('p')
      .select('MAX(p.sort_order)', 'max')
      .where('p.church_id = :churchId', { churchId })
      .getRawOne<{ max: string | null }>();
    return (row?.max ? parseInt(row.max, 10) : 0) + 1;
  }

  async update(churchId: number, id: number, params: OnchurchCustomPageWriteParams): Promise<OnchurchCustomPage> {
    const page = await this.findOwnedOrThrow(churchId, id);
    Object.assign(page, params);
    return this.pageRepository.save(page);
  }

  async updateActive(churchId: number, id: number, isActive: boolean): Promise<OnchurchCustomPage> {
    const page = await this.findOwnedOrThrow(churchId, id);
    page.isActive = isActive;
    return this.pageRepository.save(page);
  }

  // 전달된 id 순서대로 sort_order를 1부터 다시 매긴다. 남의 교회 페이지는 무시된다.
  async reorder(churchId: number, orderedIds: number[]): Promise<void> {
    const pages = await this.findAllByChurchId(churchId);
    const byId = new Map(pages.map(p => [p.id, p]));
    let order = 1;
    const dirty: OnchurchCustomPage[] = [];
    for (const id of orderedIds) {
      const page = byId.get(id);
      if (!page) continue;
      page.sortOrder = order++;
      dirty.push(page);
      byId.delete(id);
    }
    // 목록에 없던 페이지는 뒤에 이어 붙여 순번 충돌을 막는다.
    for (const page of byId.values()) {
      page.sortOrder = order++;
      dirty.push(page);
    }
    if (dirty.length > 0) await this.pageRepository.save(dirty);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const page = await this.findOwnedOrThrow(churchId, id);
    await this.pageRepository.softRemove(page);
  }

  private async findOwnedOrThrow(churchId: number, id: number): Promise<OnchurchCustomPage> {
    const page = await this.findOwnedById(churchId, id);
    if (!page) throw new OnchurchCustomPageNotFound();
    return page;
  }
}
