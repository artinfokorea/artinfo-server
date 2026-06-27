import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchSaintTagLinkRepository } from '@/onchurch/saint/domain/repository/onchurch-saint-tag-link.repository.interface';
import { OnchurchSaintTagLink } from '@/onchurch/saint/domain/entity/onchurch-saint-tag-link.entity';

@Injectable()
export class OnchurchSaintTagLinkRepository implements IOnchurchSaintTagLinkRepository {
  constructor(
    @InjectRepository(OnchurchSaintTagLink)
    private readonly repo: Repository<OnchurchSaintTagLink>,
  ) {}

  async findByChurchId(churchId: number): Promise<OnchurchSaintTagLink[]> {
    return this.repo.find({ where: { churchId } });
  }

  async findBySaintId(churchId: number, saintId: number): Promise<OnchurchSaintTagLink[]> {
    return this.repo.find({ where: { churchId, saintId } });
  }

  async replaceForSaint(churchId: number, saintId: number, tagIds: number[]): Promise<void> {
    const existing = await this.repo.find({ where: { churchId, saintId } });
    const existingTagIds = new Set(existing.map((l) => l.tagId));
    const nextTagIds = new Set(tagIds);

    const toRemove = existing.filter((l) => !nextTagIds.has(l.tagId));
    if (toRemove.length) await this.repo.softRemove(toRemove);

    const toAdd = tagIds.filter((id) => !existingTagIds.has(id));
    if (toAdd.length) {
      await this.repo.save(toAdd.map((tagId) => this.repo.create({ churchId, saintId, tagId })));
    }
  }

  async removeBySaintId(churchId: number, saintId: number): Promise<void> {
    const rows = await this.repo.find({ where: { churchId, saintId } });
    if (rows.length) await this.repo.softRemove(rows);
  }

  async removeByTagId(churchId: number, tagId: number): Promise<void> {
    const rows = await this.repo.find({ where: { churchId, tagId } });
    if (rows.length) await this.repo.softRemove(rows);
  }
}
