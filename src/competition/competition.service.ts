import { Injectable, Logger } from '@nestjs/common';
import { CompetitionNotAllowed, CompetitionNotFound, CompetitionNotPublished } from './competition.exception';
import { CompetitionRepository } from './competition.repository';
import { CompetitionListFilter, CompetitionRow, CompetitionWrite } from './competition.types';

/**
 * 콩쿠르 공고 — 회원(주최 측)이 직접 등록하면 '검토 중'으로 들어가 관리자가 게시한다. 관리자가 등록하면 바로 게시.
 * 검토 중인 공고는 등록자와 관리자만 볼 수 있다. 수정·삭제는 등록자 본인이나 관리자만.
 */
@Injectable()
export class CompetitionService {
  private readonly logger = new Logger(CompetitionService.name);

  constructor(private readonly repository: CompetitionRepository) {}

  isAdmin(userId: number) {
    return this.repository.isAdmin(userId);
  }

  findPage(filter: CompetitionListFilter) {
    return this.repository.findPage(filter);
  }

  /** 상세 — 게시된 공고는 누구나, 검토 중·숨김 공고는 등록자·관리자만. 조회수는 게시된 공고만 센다 */
  async findOne(id: number, viewerId: number | null): Promise<CompetitionRow> {
    const row = await this.repository.findById(id);
    if (!row) throw new CompetitionNotFound();
    if (row.status !== 'PUBLISHED') {
      const allowed = viewerId !== null && (row.user_id === viewerId || (await this.repository.isAdmin(viewerId)));
      if (!allowed) throw new CompetitionNotPublished();
      return row;
    }
    void this.repository.increaseViewCount(id).catch(error => this.logger.warn(`조회수 증가 실패 ${id}: ${error}`));
    return row;
  }

  async create(userId: number, input: CompetitionWrite): Promise<{ id: number; status: 'REVIEW' | 'PUBLISHED' }> {
    const status = (await this.repository.isAdmin(userId)) ? 'PUBLISHED' : 'REVIEW';
    const id = await this.repository.create(input, { userId, status, source: 'OWNER' });
    this.logger.log(`콩쿠르 등록 ${id} (${status}) — 회원 ${userId}`);
    return { id, status };
  }

  async update(id: number, userId: number, input: CompetitionWrite): Promise<void> {
    await this.assertOwnerOrAdmin(id, userId);
    await this.repository.update(id, input);
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.assertOwnerOrAdmin(id, userId);
    await this.repository.softDelete(id);
  }

  /** 관리자 승인 — 검토 중 → 게시 */
  async publish(id: number, adminId: number): Promise<void> {
    if (!(await this.repository.isAdmin(adminId))) throw new CompetitionNotAllowed();
    if (!(await this.repository.findById(id))) throw new CompetitionNotFound();
    await this.repository.updateStatus(id, 'PUBLISHED');
  }

  private async assertOwnerOrAdmin(id: number, userId: number): Promise<CompetitionRow> {
    const row = await this.repository.findById(id);
    if (!row) throw new CompetitionNotFound();
    if (row.user_id !== userId && !(await this.repository.isAdmin(userId))) throw new CompetitionNotAllowed();
    return row;
  }
}
