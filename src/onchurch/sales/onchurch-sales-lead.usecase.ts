import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IOnchurchUserRepository, ONCHURCH_USER_REPOSITORY } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchSalesLeadRepository, SalesLeadFilter, SalesLeadRow, SalesLeadSearchResult } from '@/onchurch/sales/onchurch-sales-lead.repository';
import { SalesLeadInput, sameLead, toLeadInput } from '@/onchurch/sales/sales-lead';

export type RawLead = Partial<Record<keyof SalesLeadInput, unknown>>;

/** 마스터 전용: 온교회 영업 대상(홈페이지가 없거나 오래된 교회) 목록을 모으고 연락 상태를 관리한다. */
@Injectable()
export class OnchurchSalesLeadUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    private readonly repository: OnchurchSalesLeadRepository,
  ) {}

  async search(userId: number, filter: SalesLeadFilter): Promise<SalesLeadSearchResult> {
    await this.assertMaster(userId);
    return this.repository.search(filter);
  }

  async importRows(userId: number, rows: RawLead[]): Promise<{ created: number; skipped: number; invalid: number }> {
    await this.assertMaster(userId);
    const valid: SalesLeadInput[] = [];
    let invalid = 0;
    for (const raw of rows) {
      const lead = toLeadInput(raw);
      if (lead) valid.push(lead);
      else invalid += 1;
    }
    const names = [...new Set(valid.map(l => l.name.replace(/\s/g, '')))];
    const existing = names.length ? await this.repository.findByNames(names) : [];
    const fresh: SalesLeadInput[] = [];
    for (const lead of valid) {
      if (existing.some(e => sameLead(e, lead)) || fresh.some(f => sameLead(f, lead))) continue;
      fresh.push(lead);
    }
    const created = fresh.length ? await this.repository.insertMany(fresh) : 0;
    return { created, skipped: valid.length - fresh.length, invalid };
  }

  async create(userId: number, raw: RawLead): Promise<SalesLeadRow> {
    await this.assertMaster(userId);
    const lead = this.parse(raw);
    const existing = await this.repository.findByNames([lead.name.replace(/\s/g, '')]);
    if (existing.some(e => sameLead(e, lead))) throw new ConflictException('이미 등록된 교회입니다.');
    return this.repository.insert(lead);
  }

  async update(userId: number, id: number, raw: RawLead): Promise<SalesLeadRow> {
    await this.assertMaster(userId);
    const lead = this.parse(raw);
    const before = await this.repository.findById(id);
    if (!before) throw new NotFoundException('영업 대상을 찾을 수 없습니다.');
    const contacted = lead.status !== before.status && lead.status !== 'new';
    return this.repository.update(id, lead, contacted);
  }

  async remove(userId: number, ids: number[]): Promise<{ deleted: number }> {
    await this.assertMaster(userId);
    return { deleted: ids.length ? await this.repository.softDelete(ids) : 0 };
  }

  private parse(raw: RawLead): SalesLeadInput {
    const lead = toLeadInput(raw);
    if (!lead) throw new BadRequestException('교회 이름을 입력해 주세요.');
    return lead;
  }

  private async assertMaster(userId: number): Promise<void> {
    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.role !== ONCHURCH_USER_ROLE.MASTER) throw new ForbiddenException('마스터 권한이 필요합니다.');
  }
}
