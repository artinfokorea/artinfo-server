import { Inject, Injectable } from '@nestjs/common';
import { IOngiChatRepository, ONGI_CHAT_REPOSITORY, OngiChatUserSummary } from '@/ongi/chat/domain/repository/ongi-chat.repository.interface';
import { IOngiChatRealtime, ONGI_CHAT_REALTIME } from '@/ongi/chat/domain/repository/ongi-chat-realtime.interface';
import { OngiChatRoom } from '@/ongi/chat/domain/entity/ongi-chat-room.entity';
import { OngiChatParticipant } from '@/ongi/chat/domain/entity/ongi-chat-participant.entity';
import { OngiChatMessage, OngiChatMessageCreator } from '@/ongi/chat/domain/entity/ongi-chat-message.entity';
import {
  chatPushOf,
  createdSystemText,
  directKeyOf,
  invitedSystemText,
  inviteTargetsOf,
  isOwnOngiMediaUrl,
  leftSystemText,
  normalizeChatText,
  normalizeRoomName,
  ONGI_CHAT_MAX_PARTICIPANTS,
  OngiChatReadState,
  roomTitleOf,
  unreadCountOf,
} from '@/ongi/chat/domain/service/ongi-chat-policy';
import {
  OngiChatBlocked,
  OngiChatInvalidMessage,
  OngiChatInvalidRoomName,
  OngiChatInvalidTargets,
  OngiChatNotGroupRoom,
  OngiChatRoomNotFound,
  OngiChatTooManyParticipants,
} from '@/ongi/chat/domain/exception/ongi-chat.exception';
import { IOngiMemberRepository, ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { IOngiBlockRepository, ONGI_BLOCK_REPOSITORY } from '@/ongi/group/domain/repository/ongi-block.repository.interface';
import { ONGI_MEMBER_ROLE } from '@/ongi/group/domain/entity/ongi-member.entity';
import { OngiPushService } from '@/ongi/push/application/service/ongi-push.service';

export interface OngiChatParticipantView extends OngiChatUserSummary {
  isMe: boolean;
}

/** 대화방 상세 */
export interface OngiChatRoomView {
  room: OngiChatRoom;
  title: string;
  participants: OngiChatParticipantView[];
  /** 1:1 방에서 어느 한쪽이 차단했거나 상대가 탈퇴하면 false */
  canSend: boolean;
}

/** 대화방 목록의 한 줄 */
export interface OngiChatRoomListItem {
  room: OngiChatRoom;
  title: string;
  participants: OngiChatParticipantView[];
  lastMessage: OngiChatMessage | null;
  unreadCount: number;
}

export interface OngiChatMessageView {
  message: OngiChatMessage;
  /** 시스템 메시지는 null */
  sender: OngiChatUserSummary | null;
  isMine: boolean;
  /** 이 메시지를 아직 안 읽은 사람 수 (보낸 사람 제외) */
  unreadCount: number;
}

export interface OngiCreateChatRoomCommand {
  memberIds: number[];
  name?: string;
}

export interface OngiSendChatMessageCommand {
  type: string;
  content?: string;
  mediaUrl?: string;
  thumbUrl?: string;
  /** 사진 가로/세로 */
  aspectRatio?: number;
}

const MESSAGE_PAGE_MAX = 50;
const clampAspectRatio = (value: number | undefined) => (value && Number.isFinite(value) ? Math.min(Math.max(value, 0.25), 4) : 1);
const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === '23505';

/**
 * 채팅 — 가족 공간과 따로 존재하는 대화방.
 * 공간 소속은 방을 만들거나 초대하는 순간에만 확인한다 (공간을 나가도 방·메시지·참여는 그대로).
 */
@Injectable()
export class OngiChatUseCase {
  constructor(
    @Inject(ONGI_CHAT_REPOSITORY)
    private readonly chatRepository: IOngiChatRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,

    @Inject(ONGI_BLOCK_REPOSITORY)
    private readonly blockRepository: IOngiBlockRepository,

    private readonly pushService: OngiPushService,

    @Inject(ONGI_CHAT_REALTIME)
    private readonly realtime: IOngiChatRealtime,
  ) {}

  async scanRooms(userId: number): Promise<OngiChatRoomListItem[]> {
    const rows = await this.chatRepository.scanRoomRows(userId);
    const summaries = await this.summariesOf([...new Set(rows.flatMap(row => row.userIds))]);

    return rows.map(row => {
      const participants = this.participantViewsOf(row.userIds, summaries, userId);

      return { room: row.room, title: this.titleOf(row.room, participants), participants, lastMessage: row.lastMessage, unreadCount: row.unreadCount };
    });
  }

  countUnread(userId: number): Promise<number> {
    return this.chatRepository.countUnread(userId);
  }

  /** 한 명이면 1:1 (이미 있으면 그 방), 두 명 이상이면 그룹방 */
  async createRoom(userId: number, command: OngiCreateChatRoomCommand): Promise<OngiChatRoomView> {
    const targetUserIds = await this.resolveTargets(userId, command.memberIds);
    const blocked = await this.blockRepository.blockedUserIdsOf(userId);
    if (targetUserIds.some(id => blocked.includes(id))) throw new OngiChatBlocked();

    if (targetUserIds.length === 1) {
      const room = await this.findOrCreateDirectRoom(userId, targetUserIds[0]);

      return this.roomViewOf(userId, room);
    }

    const normalized = normalizeRoomName(command.name);
    if (!normalized) throw new OngiChatInvalidRoomName();
    const userIds = [userId, ...targetUserIds];
    if (userIds.length > ONGI_CHAT_MAX_PARTICIPANTS) throw new OngiChatTooManyParticipants();

    const room = await this.chatRepository.createRoom({ type: 'group', name: normalized.name, directKey: null, creatorUserId: userId }, userIds);
    const [me] = await this.summariesOf([userId]).then(map => [map.get(userId)!]);
    await this.postSystemMessage(room.id, createdSystemText(me.name), userIds);
    this.realtime.emit(userIds, 'chat:room', { roomId: String(room.id) });

    return this.roomViewOf(userId, room);
  }

  async getRoom(userId: number, roomId: number): Promise<OngiChatRoomView> {
    const { room } = await this.requireActive(userId, roomId);

    return this.roomViewOf(userId, room);
  }

  /** 최신 순. beforeId 보다 이전 메시지를 limit 개 — 초대 전 · 지운 메시지와 내가 차단한 사람의 메시지는 빠진다 */
  async scanMessages(userId: number, roomId: number, beforeId: number | null, limit: number): Promise<OngiChatMessageView[]> {
    const { me } = await this.requireActive(userId, roomId);
    const size = Math.min(Math.max(limit, 1), MESSAGE_PAGE_MAX);

    const [messages, participants, blocked] = await Promise.all([
      this.chatRepository.scanMessages(roomId, me.visibleFromMessageId, beforeId, size),
      this.chatRepository.scanParticipants(roomId),
      this.blockRepository.blockedUserIdsOf(userId),
    ]);
    const visible = messages.filter(message => message.senderUserId === null || !blocked.includes(message.senderUserId));
    const senders = await this.summariesOf([...new Set(visible.flatMap(message => (message.senderUserId === null ? [] : [message.senderUserId])))]);
    const readStates = participants.map(readStateOf);

    return visible.map(message => this.messageViewOf(userId, message, senders, readStates));
  }

  async sendMessage(userId: number, roomId: number, command: OngiSendChatMessageCommand): Promise<OngiChatMessageView> {
    const { room } = await this.requireActive(userId, roomId);
    const creator = this.messageCreatorOf(userId, roomId, command);

    const participants = await this.chatRepository.scanParticipants(roomId);
    if (room.type === 'direct' && !(await this.canSendDirect(userId, participants))) throw new OngiChatBlocked();

    const message = await this.chatRepository.createMessage(creator);
    await this.chatRepository.markRead(roomId, userId, message.id);

    const active = participants.filter(p => !p.leftAt);
    const activeIds = active.map(p => p.userId);
    this.realtime.emit(activeIds, 'chat:message', { roomId: String(roomId), messageId: String(message.id) });

    const summaries = await this.summariesOf(activeIds);
    const senderName = summaries.get(userId)?.name ?? '';
    for (const recipientId of activeIds.filter(id => id !== userId)) {
      const otherNames = activeIds.filter(id => id !== recipientId).map(id => summaries.get(id)?.name ?? '');
      const push = chatPushOf({
        roomType: room.type,
        roomTitle: roomTitleOf(room.name, otherNames),
        senderName,
        messageType: message.type,
        content: message.content,
      });
      this.pushService.notifyUser(recipientId, userId, { ...push, data: { type: 'chat', roomId: String(roomId) }, category: 'chat', inbox: false });
    }

    const readStates = participants.map(p => (p.userId === userId ? { ...readStateOf(p), lastReadMessageId: message.id } : readStateOf(p)));

    return this.messageViewOf(userId, message, summaries, readStates);
  }

  /** 읽음 위치를 앞으로 옮긴다 — 방의 마지막 메시지를 넘지 않는다. 바뀌었을 때만 참여자에게 알린다 */
  async read(userId: number, roomId: number, messageId: number): Promise<void> {
    const { room, me } = await this.requireActive(userId, roomId);
    const target = Math.min(messageId, room.lastMessageId ?? 0);
    if (target <= me.lastReadMessageId) return;

    await this.chatRepository.markRead(roomId, userId, target);
    const participants = await this.chatRepository.scanParticipants(roomId);
    this.realtime.emit(
      participants.filter(p => !p.leftAt).map(p => p.userId),
      'chat:read',
      { roomId: String(roomId) },
    );
  }

  /** 그룹방 초대 — 참여자 누구나, 내가 속한 공간의 사람만. 초대된 사람은 초대 이후 메시지만 본다 */
  async invite(userId: number, roomId: number, memberIds: number[]): Promise<OngiChatRoomView> {
    const { room } = await this.requireActive(userId, roomId);
    if (room.type !== 'group') throw new OngiChatNotGroupRoom();

    const targetUserIds = await this.resolveTargets(userId, memberIds);
    const blocked = await this.blockRepository.blockedUserIdsOf(userId);
    if (targetUserIds.some(id => blocked.includes(id))) throw new OngiChatBlocked();

    const activeIds = (await this.chatRepository.scanParticipants(roomId)).filter(p => !p.leftAt).map(p => p.userId);
    const newIds = targetUserIds.filter(id => !activeIds.includes(id));
    if (newIds.length === 0) return this.roomViewOf(userId, room);
    if (activeIds.length + newIds.length > ONGI_CHAT_MAX_PARTICIPANTS) throw new OngiChatTooManyParticipants();

    await this.chatRepository.addParticipants(roomId, newIds, room.lastMessageId ?? 0);
    const summaries = await this.summariesOf([userId, ...newIds]);
    const everyone = [...activeIds, ...newIds];
    await this.postSystemMessage(
      roomId,
      invitedSystemText(
        summaries.get(userId)?.name ?? '',
        newIds.map(id => summaries.get(id)?.name ?? ''),
      ),
      everyone,
    );
    this.realtime.emit(everyone, 'chat:room', { roomId: String(roomId) });

    return this.roomViewOf(userId, (await this.chatRepository.findRoomById(roomId)) ?? room);
  }

  /** 그룹방은 나가기(시스템 메시지), 1:1 방은 내 목록에서만 지우기 — 상대가 새로 보내면 다시 나타난다 */
  async leave(userId: number, roomId: number): Promise<void> {
    const { room } = await this.requireActive(userId, roomId);

    if (room.type !== 'group') {
      await this.chatRepository.hideUntil(roomId, userId, room.lastMessageId ?? 0);
      this.realtime.emit([userId], 'chat:room', { roomId: String(roomId) });
      return;
    }

    await this.chatRepository.leave(roomId, userId);
    const remaining = (await this.chatRepository.scanParticipants(roomId)).filter(p => !p.leftAt).map(p => p.userId);
    const summaries = await this.summariesOf([userId]);
    await this.postSystemMessage(roomId, leftSystemText(summaries.get(userId)?.name ?? ''), remaining);
    this.realtime.emit([...remaining, userId], 'chat:room', { roomId: String(roomId) });
  }

  private async requireActive(userId: number, roomId: number): Promise<{ room: OngiChatRoom; me: OngiChatParticipant }> {
    const [room, me] = await Promise.all([this.chatRepository.findRoomById(roomId), this.chatRepository.findParticipant(roomId, userId)]);
    if (!room || !me || me.leftAt) throw new OngiChatRoomNotFound();

    return { room, me };
  }

  /** 고른 구성원 → 사용자 id. 없는 · 승인 대기 · 내가 속하지 않은 공간의 구성원이 섞이거나, 나 말고 아무도 없으면 거부 */
  private async resolveTargets(userId: number, memberIds: number[]): Promise<number[]> {
    const [mine, targets] = await Promise.all([
      this.memberRepository.scanByUserId(userId),
      Promise.all([...new Set(memberIds)].map(id => this.memberRepository.findById(id))),
    ]);
    if (targets.some(target => !target || target.role === ONGI_MEMBER_ROLE.PENDING)) throw new OngiChatInvalidTargets();

    const myGroupIds = mine.filter(member => member.role !== ONGI_MEMBER_ROLE.PENDING).map(member => member.groupId);
    const { userIds, outsider } = inviteTargetsOf(
      userId,
      targets.map(target => ({ userId: target!.userId, groupId: target!.groupId })),
      myGroupIds,
    );
    if (outsider || userIds.length === 0) throw new OngiChatInvalidTargets();

    return userIds;
  }

  private async findOrCreateDirectRoom(userId: number, targetUserId: number): Promise<OngiChatRoom> {
    const directKey = directKeyOf(userId, targetUserId);
    const existing = await this.chatRepository.findRoomByDirectKey(directKey);
    if (existing) return existing;

    try {
      return await this.chatRepository.createRoom({ type: 'direct', name: null, directKey, creatorUserId: userId }, [userId, targetUserId]);
    } catch (error) {
      // 두 사람이 동시에 만들면 한쪽은 unique 위반 — 먼저 만들어진 방을 쓴다
      if (!isUniqueViolation(error)) throw error;
      const created = await this.chatRepository.findRoomByDirectKey(directKey);
      if (!created) throw error;

      return created;
    }
  }

  private messageCreatorOf(userId: number, roomId: number, command: OngiSendChatMessageCommand): OngiChatMessageCreator {
    if (command.type === 'text') {
      const content = normalizeChatText(command.content);
      if (!content) throw new OngiChatInvalidMessage();

      return { roomId, senderUserId: userId, type: 'text', content, mediaUrl: null, thumbUrl: null, aspectRatio: 1 };
    }
    if (command.type === 'photo') {
      if (!isOwnOngiMediaUrl(command.mediaUrl, userId) || (command.thumbUrl && !isOwnOngiMediaUrl(command.thumbUrl, userId)))
        throw new OngiChatInvalidMessage();

      return {
        roomId,
        senderUserId: userId,
        type: 'photo',
        content: '',
        mediaUrl: command.mediaUrl!,
        thumbUrl: command.thumbUrl || null,
        aspectRatio: clampAspectRatio(command.aspectRatio),
      };
    }
    throw new OngiChatInvalidMessage();
  }

  /** 1:1 — 상대가 탈퇴했거나 어느 한쪽이라도 차단했으면 보낼 수 없다 */
  private async canSendDirect(userId: number, participants: OngiChatParticipant[]): Promise<boolean> {
    const other = participants.find(p => p.userId !== userId);
    if (!other) return false;

    const [summary] = await this.chatRepository.scanUserSummaries([other.userId]);
    if (!summary || summary.deleted) return false;

    const [myBlocks, theirBlocks] = await Promise.all([this.blockRepository.blockedUserIdsOf(userId), this.blockRepository.blockedUserIdsOf(other.userId)]);

    return !myBlocks.includes(other.userId) && !theirBlocks.includes(userId);
  }

  private async postSystemMessage(roomId: number, content: string, notifyUserIds: number[]): Promise<void> {
    const message = await this.chatRepository.createMessage({
      roomId,
      senderUserId: null,
      type: 'system',
      content,
      mediaUrl: null,
      thumbUrl: null,
      aspectRatio: 1,
    });
    this.realtime.emit(notifyUserIds, 'chat:message', { roomId: String(roomId), messageId: String(message.id) });
  }

  private async roomViewOf(userId: number, room: OngiChatRoom): Promise<OngiChatRoomView> {
    const participants = await this.chatRepository.scanParticipants(room.id);
    // 1:1 은 상대가 탈퇴로 빠졌어도 두 사람을 모두 보여준다
    const shown = room.type === 'direct' ? participants : participants.filter(p => !p.leftAt);
    const userIds = shown.map(p => p.userId);
    const views = this.participantViewsOf(userIds, await this.summariesOf(userIds), userId);
    const canSend = room.type === 'direct' ? await this.canSendDirect(userId, participants) : true;

    return { room, title: this.titleOf(room, views), participants: views, canSend };
  }

  private titleOf(room: OngiChatRoom, participants: OngiChatParticipantView[]): string {
    return roomTitleOf(
      room.type === 'direct' ? null : room.name,
      participants.filter(p => !p.isMe).map(p => p.name),
    );
  }

  private participantViewsOf(userIds: number[], summaries: Map<number, OngiChatUserSummary>, viewerUserId: number): OngiChatParticipantView[] {
    return userIds.flatMap(id => {
      const summary = summaries.get(id);
      return summary ? [{ ...summary, isMe: id === viewerUserId }] : [];
    });
  }

  private messageViewOf(
    userId: number,
    message: OngiChatMessage,
    senders: Map<number, OngiChatUserSummary>,
    readStates: OngiChatReadState[],
  ): OngiChatMessageView {
    return {
      message,
      sender: message.senderUserId === null ? null : (senders.get(message.senderUserId) ?? null),
      isMine: message.senderUserId === userId,
      unreadCount: unreadCountOf(message, readStates),
    };
  }

  private async summariesOf(userIds: number[]): Promise<Map<number, OngiChatUserSummary>> {
    if (userIds.length === 0) return new Map();
    const summaries = await this.chatRepository.scanUserSummaries(userIds);

    return new Map(summaries.map(summary => [summary.id, summary]));
  }
}

const readStateOf = (p: OngiChatParticipant): OngiChatReadState => ({
  userId: p.userId,
  lastReadMessageId: p.lastReadMessageId,
  visibleFromMessageId: p.visibleFromMessageId,
  left: p.leftAt !== null && p.leftAt !== undefined,
});
