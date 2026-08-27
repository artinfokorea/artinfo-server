import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOngiMemberRepository, OngiMemberView } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { ONGI_MEMBER_ROLE, OngiMember, OngiMemberCreator } from '@/ongi/group/domain/entity/ongi-member.entity';

@Injectable()
export class OngiMemberRepository implements IOngiMemberRepository {
  constructor(
    @InjectRepository(OngiMember)
    private readonly memberRepository: Repository<OngiMember>,
  ) {}

  async create(creator: OngiMemberCreator): Promise<OngiMember> {
    return this.memberRepository.save({
      groupId: creator.groupId,
      userId: creator.userId,
      name: creator.name,
      role: creator.role,
      avatarUrl: creator.avatarUrl,
    });
  }

  async findById(id: number): Promise<OngiMember | null> {
    return this.memberRepository.findOneBy({ id });
  }

  async findByGroupIdAndUserId(groupId: number, userId: number): Promise<OngiMember | null> {
    return this.memberRepository.findOneBy({ groupId, userId });
  }

  async scanByUserId(userId: number): Promise<OngiMember[]> {
    return this.memberRepository.find({ where: { userId }, order: { id: 'ASC' } });
  }

  async scanViewsByGroupId(groupId: number, viewerUserId: number): Promise<OngiMemberView[]> {
    const members = await this.memberRepository.find({ where: { groupId }, order: { id: 'ASC' } });

    return this.toViews(members, viewerUserId);
  }

  async getViewById(id: number, viewerUserId: number): Promise<OngiMemberView | null> {
    const member = await this.findById(id);
    if (!member) return null;

    const [view] = await this.toViews([member], viewerUserId);

    return view ?? null;
  }

  async scanByGroupId(groupId: number): Promise<OngiMember[]> {
    return this.memberRepository.find({ where: { groupId }, order: { id: 'ASC' } });
  }

  async updateRole(id: number, role: ONGI_MEMBER_ROLE): Promise<void> {
    await this.memberRepository.update({ id }, { role });
  }

  async softDeleteById(id: number): Promise<void> {
    await this.memberRepository.softDelete({ id });
  }

  private async toViews(members: OngiMember[], viewerUserId: number): Promise<OngiMemberView[]> {
    if (members.length === 0) return [];

    const memberIds = members.map(member => member.id);
    const userIds = members.map(member => member.userId);

    const realNameRows: { id: number; name: string }[] = await this.memberRepository.manager.query(`SELECT id, name FROM ongi_users WHERE id = ANY($1)`, [
      userIds,
    ]);
    const photoCountRows: { author_member_id: number; count: string }[] = await this.memberRepository.manager.query(
      `SELECT author_member_id, COUNT(*) AS count FROM ongi_photos WHERE author_member_id = ANY($1) AND deleted_at IS NULL GROUP BY author_member_id`,
      [memberIds],
    );

    const blockedRows: { blocked_user_id: number }[] = await this.memberRepository.manager.query(
      `SELECT blocked_user_id FROM ongi_blocks WHERE user_id = $1 AND blocked_user_id = ANY($2)`,
      [viewerUserId, userIds],
    );

    const realNames = new Map(realNameRows.map(row => [Number(row.id), row.name]));
    const blockedUserIds = new Set(blockedRows.map(row => Number(row.blocked_user_id)));
    const photoCounts = new Map(photoCountRows.map(row => [Number(row.author_member_id), Number(row.count)]));

    return members.map(member => ({
      member,
      realName: realNames.get(member.userId) ?? null,
      photoCount: photoCounts.get(member.id) ?? 0,
      blockedByMe: blockedUserIds.has(member.userId),
      isMe: member.userId === viewerUserId,
    }));
  }
}
