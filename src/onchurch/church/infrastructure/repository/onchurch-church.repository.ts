import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IOnchurchChurchRepository, OnchurchChurchUpsertParams } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchChurchNotFound } from '@/onchurch/church/domain/exception/onchurch-church.exception';

@Injectable()
export class OnchurchChurchRepository implements IOnchurchChurchRepository {
  constructor(
    @InjectRepository(OnchurchChurch)
    private readonly churchRepository: Repository<OnchurchChurch>,
  ) {}

  async findByOwnerId(ownerId: number): Promise<OnchurchChurch | null> {
    return this.churchRepository.findOneBy({ ownerId });
  }

  async findById(id: number): Promise<OnchurchChurch | null> {
    return this.churchRepository.findOneBy({ id });
  }

  async findBySlug(slug: string): Promise<OnchurchChurch | null> {
    return this.churchRepository.findOneBy({ slug });
  }

  async findPublishedBySlug(slug: string): Promise<OnchurchChurch | null> {
    return this.churchRepository.findOneBy({ slug, isPublished: true });
  }

  async findAllPublished(): Promise<OnchurchChurch[]> {
    return this.churchRepository.find({
      where: { isPublished: true },
      order: { sortOrder: { direction: 'ASC', nulls: 'LAST' }, createdAt: 'DESC', id: 'DESC' },
    });
  }

  async findPublishedWithExpiredSubscription(now: Date): Promise<OnchurchChurch[]> {
    // free_trial / paid 둘 다 만료(null 이거나 now 이하)인 published 교회만.
    return this.churchRepository
      .createQueryBuilder('church')
      .innerJoin(OnchurchUser, 'u', 'u.id = church.owner_id AND u.deleted_at IS NULL')
      .where('church.is_published = :pub', { pub: true })
      .andWhere('(u.free_trial_until IS NULL OR u.free_trial_until <= :now)', { now })
      .andWhere('(u.paid_until IS NULL OR u.paid_until <= :now)', { now })
      .getMany();
  }

  async bulkUnpublishByOwnerIds(ownerIds: number[]): Promise<number> {
    if (ownerIds.length === 0) return 0;
    const result = await this.churchRepository.update({ ownerId: In(ownerIds), isPublished: true }, { isPublished: false });
    return result.affected ?? 0;
  }

  async upsertByOwnerId(ownerId: number, params: OnchurchChurchUpsertParams): Promise<OnchurchChurch> {
    const existing = await this.churchRepository.findOneBy({ ownerId });

    if (existing) {
      // 라이브가 꺼짐→켜짐으로 바뀔 때만 시작 시각을 갱신한다(다른 항목 저장 시 리셋 방지).
      const liveStartedAt =
        params.isLive && !existing.isLive ? new Date() : params.isLive ? existing.liveStartedAt : null;
      Object.assign(existing, {
        slug: params.slug,
        name: params.name,
        eng: params.eng,
        tagline: params.tagline,
        phone: params.phone,
        email: params.email,
        address: params.address,
        representative: params.representative,
        businessNo: params.businessNo,
        logoUrl: params.logoUrl,
        youtubeUrl: params.youtubeUrl,
        liveChannelId: params.liveChannelId,
        isLive: params.isLive,
        liveStartedAt,
        enabledPages: params.enabledPages,
        homeSectionOrder: params.homeSectionOrder,
      });
      return this.churchRepository.save(existing);
    }

    const created = this.churchRepository.create({
      ownerId,
      ...params,
      liveStartedAt: params.isLive ? new Date() : null,
    });
    return this.churchRepository.save(created);
  }

  async updatePublished(ownerId: number, isPublished: boolean, firstPublishedAt?: Date): Promise<OnchurchChurch> {
    const church = await this.churchRepository.findOneBy({ ownerId });
    if (!church) throw new OnchurchChurchNotFound();
    church.isPublished = isPublished;
    if (firstPublishedAt && !church.firstPublishedAt) {
      church.firstPublishedAt = firstPublishedAt;
    }
    return this.churchRepository.save(church);
  }
}
