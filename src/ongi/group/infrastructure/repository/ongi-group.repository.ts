import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IOngiGroupRepository, OngiGroupSummary } from '@/ongi/group/domain/repository/ongi-group.repository.interface';
import { OngiGroup, OngiGroupCreator } from '@/ongi/group/domain/entity/ongi-group.entity';

@Injectable()
export class OngiGroupRepository implements IOngiGroupRepository {
  constructor(
    @InjectRepository(OngiGroup)
    private readonly groupRepository: Repository<OngiGroup>,
  ) {}

  async create(creator: OngiGroupCreator): Promise<OngiGroup> {
    return this.groupRepository.save({
      name: creator.name,
      inviteCode: creator.inviteCode,
      inviteExpiresAt: creator.inviteExpiresAt,
    });
  }

  async findById(id: number): Promise<OngiGroup | null> {
    return this.groupRepository.findOneBy({ id });
  }

  async findByInviteCode(inviteCode: string): Promise<OngiGroup | null> {
    return this.groupRepository.findOneBy({ inviteCode });
  }

  async renewInviteCode(group: OngiGroup, inviteCode: string, inviteExpiresAt: Date): Promise<OngiGroup> {
    group.inviteCode = inviteCode;
    group.inviteExpiresAt = inviteExpiresAt;

    return this.groupRepository.save(group);
  }

  async softDeleteById(id: number): Promise<void> {
    await this.groupRepository.softDelete({ id });
  }

  async scanSummariesByIds(ids: number[]): Promise<OngiGroupSummary[]> {
    if (ids.length === 0) return [];

    const groups = await this.groupRepository.find({ where: { id: In(ids) }, order: { id: 'ASC' } });

    const memberCountRows: { group_id: number; count: string }[] = await this.groupRepository.manager.query(
      `SELECT group_id, COUNT(*) AS count FROM ongi_members WHERE group_id = ANY($1) AND deleted_at IS NULL GROUP BY group_id`,
      [ids],
    );
    const photoCountRows: { group_id: number; count: string }[] = await this.groupRepository.manager.query(
      `SELECT group_id, COUNT(*) AS count FROM ongi_photos WHERE group_id = ANY($1) AND deleted_at IS NULL GROUP BY group_id`,
      [ids],
    );

    const memberCounts = new Map(memberCountRows.map(row => [Number(row.group_id), Number(row.count)]));
    const photoCounts = new Map(photoCountRows.map(row => [Number(row.group_id), Number(row.count)]));

    return groups.map(group => ({
      group,
      memberCount: memberCounts.get(group.id) ?? 0,
      photoCount: photoCounts.get(group.id) ?? 0,
    }));
  }
}
