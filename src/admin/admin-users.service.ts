import { Injectable, Logger } from '@nestjs/common';
import { AdminUsersRepository } from '@/admin/repository/admin-users.repository';
import { assertCanChangeType, assertCanWithdraw, clampPage, clampSize, normalizeFilter, normalizeQuery } from '@/admin/domain/admin-users.policy';
import { AdminUsersResponse, AdminUsersSummaryResponse } from '@/admin/dto/admin-users.response';
import { USER_TYPE } from '@/user/entity/user.entity';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(private readonly repository: AdminUsersRepository) {}

  async summary(): Promise<AdminUsersSummaryResponse> {
    return new AdminUsersSummaryResponse(await this.repository.summary());
  }

  async list(args: { filter?: string; query?: string; page?: number; size?: number }): Promise<AdminUsersResponse> {
    const filter = normalizeFilter(args.filter);
    const query = normalizeQuery(args.query);
    const page = clampPage(args.page);
    const size = clampSize(args.size);
    const { total, rows } = await this.repository.findUsers(filter, query, page, size);
    return new AdminUsersResponse({ total, page, size, filter, query, rows });
  }

  async changeType(actorId: number, userId: number, type: USER_TYPE): Promise<void> {
    const target = await this.repository.findTarget(userId);
    assertCanChangeType(actorId, target);
    await this.repository.updateType(userId, type);
    this.logger.log(`회원 ${userId} 역할 → ${type} (관리자 ${actorId})`);
  }

  async withdraw(actorId: number, userId: number): Promise<void> {
    const target = await this.repository.findTarget(userId);
    assertCanWithdraw(actorId, target);
    await this.repository.withdraw(userId);
    this.logger.log(`회원 ${userId} 탈퇴 처리 (관리자 ${actorId})`);
  }
}
