import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  IOnchurchChurchOverviewRepository,
  OnchurchChurchOverviewRow,
} from '@/onchurch/master/domain/repository/onchurch-church-overview.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { PagingItems } from '@/common/type/type';

@Injectable()
export class OnchurchChurchOverviewRepository implements IOnchurchChurchOverviewRepository {
  constructor(
    @InjectRepository(OnchurchChurch)
    private readonly churchRepository: Repository<OnchurchChurch>,
  ) {}

  async findPage(params: {
    keyword: string | null;
    publishedOnly: boolean;
    page: number;
    size: number;
  }): Promise<PagingItems<OnchurchChurchOverviewRow>> {
    const keyword = params.keyword?.trim();

    // church.owner_id = user.id 직접 조인 (정식 relation이 아니므로 임의 조인 사용)
    const base = (): SelectQueryBuilder<OnchurchChurch> => {
      const qb = this.churchRepository
        .createQueryBuilder('church')
        .leftJoin(OnchurchUser, 'owner', 'owner.id = church.owner_id');
      if (params.publishedOnly) {
        qb.andWhere('church.is_published = :published', { published: true });
      }
      if (keyword) {
        qb.andWhere('(church.name ILIKE :kw OR owner.name ILIKE :kw OR owner.phone ILIKE :kw)', {
          kw: `%${keyword}%`,
        });
      }
      return qb;
    };

    const totalCount = await base().getCount();

    const rows = await base()
      // 소유자(owner)의 마지막 세션 갱신 시각 = 마지막 접속(활동) 근사치.
      // 로그인 시 onchurch_auths 행이 INSERT되고, 토큰 갱신 시 updated_at이 UPDATE된다.
      .leftJoin(
        (sub) =>
          sub
            .select('auth.user_id', 'user_id')
            .addSelect('MAX(auth.updated_at)', 'last_activity')
            .from(OnchurchAuth, 'auth')
            .groupBy('auth.user_id'),
        'sess',
        'sess.user_id = church.owner_id',
      )
      .select('church.id', 'id')
      .addSelect('church.name', 'name')
      .addSelect('church.slug', 'slug')
      .addSelect('church.address', 'address')
      .addSelect('church.is_published', 'isPublished')
      .addSelect('church.first_published_at', 'firstPublishedAt')
      .addSelect('owner.name', 'ownerName')
      .addSelect('owner.phone', 'ownerPhone')
      .addSelect('owner.free_trial_until', 'freeTrialUntil')
      .addSelect('owner.paid_until', 'paidUntil')
      .addSelect('owner.is_test', 'isTest')
      .addSelect('church.naver_verification', 'naverVerification')
      .addSelect('church.site_template', 'siteTemplate')
      .addSelect('sess.last_activity', 'lastActivity')
      .orderBy('church.id', 'DESC')
      .offset((params.page - 1) * params.size)
      .limit(params.size)
      .getRawMany();

    const items: OnchurchChurchOverviewRow[] = rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      slug: r.slug,
      address: r.address ?? null,
      isPublished: !!r.isPublished,
      firstPublishedAt: r.firstPublishedAt ? new Date(r.firstPublishedAt) : null,
      ownerName: r.ownerName ?? null,
      ownerPhone: r.ownerPhone ?? null,
      freeTrialUntil: r.freeTrialUntil ? new Date(r.freeTrialUntil) : null,
      paidUntil: r.paidUntil ? new Date(r.paidUntil) : null,
      naverVerification: r.naverVerification ?? null,
      siteTemplate: r.siteTemplate?.trim() || 'default',
      isTest: !!r.isTest,
      lastActivity: r.lastActivity ? new Date(r.lastActivity) : null,
    }));

    return { items, totalCount };
  }

  async findOwnerIdByChurchId(churchId: number): Promise<number | null> {
    const church = await this.churchRepository.findOne({ where: { id: churchId }, select: { id: true, ownerId: true } });
    return church?.ownerId ?? null;
  }

  async updateNaverVerification(churchId: number, naverVerification: string | null): Promise<boolean> {
    const result = await this.churchRepository.update({ id: churchId }, { naverVerification });
    return (result.affected ?? 0) > 0;
  }

  async updateSiteTemplate(churchId: number, siteTemplate: string): Promise<boolean> {
    const result = await this.churchRepository.update({ id: churchId }, { siteTemplate });
    return (result.affected ?? 0) > 0;
  }

  async updatePublished(churchId: number, isPublished: boolean): Promise<boolean> {
    const result = await this.churchRepository.update({ id: churchId }, { isPublished });
    return (result.affected ?? 0) > 0;
  }
}
