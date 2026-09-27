import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IOngiChatRepository, OngiChatRoomRow, OngiChatUserSummary } from '@/ongi/chat/domain/repository/ongi-chat.repository.interface';
import { OngiChatRoom, OngiChatRoomCreator } from '@/ongi/chat/domain/entity/ongi-chat-room.entity';
import { OngiChatParticipant } from '@/ongi/chat/domain/entity/ongi-chat-participant.entity';
import { OngiChatMessage, OngiChatMessageCreator } from '@/ongi/chat/domain/entity/ongi-chat-message.entity';

/** 목록에 보일 방 최대 개수 */
const ROOM_LIST_LIMIT = 200;

/**
 * 안 읽은 메시지 조건 — 내 읽음 위치(또는 보이기 시작한 위치) 이후, 시스템 메시지·내 메시지·내가 차단한 사람의 메시지 제외.
 * p = 내 참여 행, m = 메시지, $1 = 내 user id
 */
const UNREAD_CONDITION = `
  m.id > GREATEST(p.last_read_message_id, p.visible_from_message_id)
  AND m.type <> 'system'
  AND m.sender_user_id IS DISTINCT FROM $1
  AND m.sender_user_id NOT IN (SELECT b.blocked_user_id FROM ongi_blocks b WHERE b.user_id = $1)`;

@Injectable()
export class OngiChatRepository implements IOngiChatRepository {
  constructor(
    @InjectRepository(OngiChatRoom)
    private readonly roomRepository: Repository<OngiChatRoom>,

    @InjectRepository(OngiChatParticipant)
    private readonly participantRepository: Repository<OngiChatParticipant>,

    @InjectRepository(OngiChatMessage)
    private readonly messageRepository: Repository<OngiChatMessage>,
  ) {}

  findRoomById(roomId: number): Promise<OngiChatRoom | null> {
    return this.roomRepository.findOneBy({ id: roomId });
  }

  findRoomByDirectKey(directKey: string): Promise<OngiChatRoom | null> {
    return this.roomRepository.findOneBy({ directKey });
  }

  async createRoom(creator: OngiChatRoomCreator, userIds: number[]): Promise<OngiChatRoom> {
    return this.roomRepository.manager.transaction(async manager => {
      const room = await manager.save(
        manager.create(OngiChatRoom, { type: creator.type, name: creator.name, directKey: creator.directKey, creatorUserId: creator.creatorUserId }),
      );
      await manager.save(
        userIds.map(userId => manager.create(OngiChatParticipant, { roomId: room.id, userId, lastReadMessageId: 0, visibleFromMessageId: 0 })),
      );

      return room;
    });
  }

  findParticipant(roomId: number, userId: number): Promise<OngiChatParticipant | null> {
    return this.participantRepository.findOneBy({ roomId, userId });
  }

  scanParticipants(roomId: number): Promise<OngiChatParticipant[]> {
    return this.participantRepository.find({ where: { roomId }, order: { id: 'ASC' } });
  }

  async addParticipants(roomId: number, userIds: number[], fromMessageId: number): Promise<void> {
    if (userIds.length === 0) return;
    await this.participantRepository.query(
      `INSERT INTO ongi_chat_participants (room_id, user_id, last_read_message_id, visible_from_message_id)
       SELECT $1, u, $3, $3 FROM unnest($2::int[]) AS u
       ON CONFLICT (room_id, user_id) DO UPDATE
         SET left_at = NULL,
             last_read_message_id = EXCLUDED.last_read_message_id,
             visible_from_message_id = EXCLUDED.visible_from_message_id,
             updated_at = now()`,
      [roomId, userIds, fromMessageId],
    );
  }

  async leave(roomId: number, userId: number): Promise<void> {
    await this.participantRepository.query(
      `UPDATE ongi_chat_participants SET left_at = now(), updated_at = now() WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL`,
      [roomId, userId],
    );
  }

  async hideUntil(roomId: number, userId: number, messageId: number): Promise<void> {
    await this.participantRepository.query(
      `UPDATE ongi_chat_participants
          SET visible_from_message_id = GREATEST(visible_from_message_id, $3),
              last_read_message_id = GREATEST(last_read_message_id, $3),
              updated_at = now()
        WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId, messageId],
    );
  }

  async markRead(roomId: number, userId: number, messageId: number): Promise<number> {
    await this.participantRepository.query(
      `UPDATE ongi_chat_participants SET last_read_message_id = $3, updated_at = now()
        WHERE room_id = $1 AND user_id = $2 AND last_read_message_id < $3`,
      [roomId, userId, messageId],
    );
    const participant = await this.findParticipant(roomId, userId);

    return participant?.lastReadMessageId ?? 0;
  }

  async leaveAllOfUser(userId: number): Promise<void> {
    await this.participantRepository.query(`UPDATE ongi_chat_participants SET left_at = now(), updated_at = now() WHERE user_id = $1 AND left_at IS NULL`, [
      userId,
    ]);
  }

  async createMessage(creator: OngiChatMessageCreator): Promise<OngiChatMessage> {
    return this.messageRepository.manager.transaction(async manager => {
      const message = await manager.save(manager.create(OngiChatMessage, creator));
      await manager.query(`UPDATE ongi_chat_rooms SET last_message_id = $2, last_message_at = $3, updated_at = now() WHERE id = $1`, [
        creator.roomId,
        message.id,
        message.createdAt,
      ]);

      return message;
    });
  }

  findMessageById(messageId: number): Promise<OngiChatMessage | null> {
    return this.messageRepository.findOneBy({ id: messageId });
  }

  async scanMessages(roomId: number, visibleFromMessageId: number, beforeId: number | null, limit: number): Promise<OngiChatMessage[]> {
    const query = this.messageRepository
      .createQueryBuilder('m')
      .where('m.room_id = :roomId', { roomId })
      .andWhere('m.id > :visibleFromMessageId', { visibleFromMessageId })
      .orderBy('m.id', 'DESC')
      .take(limit);
    if (beforeId !== null) query.andWhere('m.id < :beforeId', { beforeId });

    return query.getMany();
  }

  async scanRoomRows(userId: number): Promise<OngiChatRoomRow[]> {
    const mine = await this.participantRepository.query(
      `SELECT p.room_id AS "roomId"
         FROM ongi_chat_participants p
         JOIN ongi_chat_rooms r ON r.id = p.room_id
        WHERE p.user_id = $1
          AND p.left_at IS NULL
          AND r.last_message_id > p.visible_from_message_id
        ORDER BY r.last_message_at DESC, r.id DESC
        LIMIT ${ROOM_LIST_LIMIT}`,
      [userId],
    );
    const roomIds: number[] = mine.map((row: { roomId: number }) => Number(row.roomId));
    if (roomIds.length === 0) return [];

    const [rooms, participants, unreadRows] = await Promise.all([
      this.roomRepository.findBy({ id: In(roomIds) }),
      this.participantRepository.find({ where: { roomId: In(roomIds) }, order: { id: 'ASC' } }),
      this.participantRepository.query(
        `SELECT p.room_id AS "roomId", COUNT(m.id)::int AS "count"
           FROM ongi_chat_participants p
           JOIN ongi_chat_messages m ON m.room_id = p.room_id
          WHERE p.user_id = $1 AND p.room_id = ANY($2) AND ${UNREAD_CONDITION}
          GROUP BY p.room_id`,
        [userId, roomIds],
      ),
    ]);
    const lastMessageIds = rooms.flatMap(room => (room.lastMessageId ? [room.lastMessageId] : []));
    const lastMessages = lastMessageIds.length > 0 ? await this.messageRepository.findBy({ id: In(lastMessageIds) }) : [];

    const roomById = new Map(rooms.map(room => [room.id, room]));
    const messageById = new Map(lastMessages.map(message => [message.id, message]));
    const unreadByRoom = new Map<number, number>(unreadRows.map((row: { roomId: number; count: number }) => [Number(row.roomId), Number(row.count)]));

    return roomIds.flatMap(roomId => {
      const room = roomById.get(roomId);
      const roomParticipants = participants.filter(p => p.roomId === roomId);
      const me = roomParticipants.find(p => p.userId === userId);
      if (!room || !me) return [];

      return [
        {
          room,
          me,
          lastMessage: room.lastMessageId ? (messageById.get(room.lastMessageId) ?? null) : null,
          unreadCount: unreadByRoom.get(roomId) ?? 0,
          // 1:1 은 상대가 탈퇴로 빠졌어도 두 사람 모두 보여준다
          userIds: roomParticipants.filter(p => room.type === 'direct' || !p.leftAt).map(p => p.userId),
        },
      ];
    });
  }

  async countUnread(userId: number): Promise<number> {
    const [row] = await this.participantRepository.query(
      `SELECT COUNT(m.id)::int AS "count"
         FROM ongi_chat_participants p
         JOIN ongi_chat_messages m ON m.room_id = p.room_id
        WHERE p.user_id = $1 AND p.left_at IS NULL AND ${UNREAD_CONDITION}`,
      [userId],
    );

    return Number(row?.count ?? 0);
  }

  async scanUserSummaries(userIds: number[]): Promise<OngiChatUserSummary[]> {
    if (userIds.length === 0) return [];
    const rows: { id: number; name: string; iconImageUrl: string | null; deletedAt: Date | null }[] = await this.roomRepository.query(
      `SELECT id, name, icon_image_url AS "iconImageUrl", deleted_at AS "deletedAt" FROM ongi_users WHERE id = ANY($1)`,
      [userIds],
    );

    return rows.map(row => ({ id: Number(row.id), name: row.name, avatarUrl: row.iconImageUrl, deleted: row.deletedAt !== null }));
  }
}
