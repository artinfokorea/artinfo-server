import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOnchurchDashboardRepository,
  OnchurchPaidChurchInflowDay,
  OnchurchSignupFunnel,
} from '@/onchurch/master/domain/repository/onchurch-dashboard.repository.interface';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';

// created_at은 timestamp(무TZ, UTC 저장)이므로 KST 기준 월/일로 버킷팅하기 위해 변환한다.
// (paid_until 저장 시 +09:00을 명시하는 것과 동일한 KST 기준을 맞춘다)
const KST = "AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul'";

@Injectable()
export class OnchurchDashboardRepository implements IOnchurchDashboardRepository {
  constructor(
    @InjectRepository(OnchurchUser)
    private readonly userRepository: Repository<OnchurchUser>,
  ) {}

  async signupFunnel(params: { month: string }): Promise<OnchurchSignupFunnel> {
    // 랜딩 가입 코호트: role in (admin, owner) — 성도(member)/마스터 제외, 테스트 계정 제외.
    // 교회 생성 여부는 church.owner_id 존재로 판단(owner_id unique → 행 증식 없음).
    const row = await this.userRepository
      .createQueryBuilder('u')
      .leftJoin(OnchurchChurch, 'church', 'church.owner_id = u.id AND church.deleted_at IS NULL')
      .select('COUNT(*)', 'signups')
      .addSelect('COUNT(church.id)', 'createdChurch')
      .addSelect('COUNT(*) FILTER (WHERE u.paid_until IS NOT NULL)', 'paid')
      .where("u.role IN ('admin', 'owner')")
      .andWhere('u.is_test = false')
      .andWhere('u.deleted_at IS NULL')
      .andWhere(`to_char(u.created_at ${KST}, 'YYYY-MM') = :month`, { month: params.month })
      .getRawOne<{ signups: string; createdChurch: string; paid: string }>();

    return {
      signups: Number(row?.signups) || 0,
      createdChurch: Number(row?.createdChurch) || 0,
      paid: Number(row?.paid) || 0,
    };
  }

  async paidChurchInflowByDay(params: { month: string }): Promise<OnchurchPaidChurchInflowDay[]> {
    // 결제 교회 유입 = church.created_at이 해당 월이고 owner.paid_until이 존재, 테스트 계정 제외. 날짜별 집계.
    const rows = await this.userRepository.manager
      .createQueryBuilder(OnchurchChurch, 'c')
      .innerJoin(OnchurchUser, 'owner', 'owner.id = c.owner_id')
      .select(`to_char(c.created_at ${KST}, 'YYYY-MM-DD')`, 'date')
      .addSelect('COUNT(*)', 'count')
      .where('owner.paid_until IS NOT NULL')
      .andWhere('owner.is_test = false')
      .andWhere('c.deleted_at IS NULL')
      .andWhere(`to_char(c.created_at ${KST}, 'YYYY-MM') = :month`, { month: params.month })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    return rows.map((r) => ({ date: r.date, count: Number(r.count) || 0 }));
  }
}
