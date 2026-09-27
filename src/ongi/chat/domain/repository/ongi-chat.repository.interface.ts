import { OngiChatRoom, OngiChatRoomCreator } from '@/ongi/chat/domain/entity/ongi-chat-room.entity';
import { OngiChatParticipant } from '@/ongi/chat/domain/entity/ongi-chat-participant.entity';
import { OngiChatMessage, OngiChatMessageCreator } from '@/ongi/chat/domain/entity/ongi-chat-message.entity';

export const ONGI_CHAT_REPOSITORY = Symbol('ONGI_CHAT_REPOSITORY');

/** 채팅에 보일 사용자 — 이름·사진은 계정(ongi_users) 기준. 탈퇴한 사용자는 이름이 '탈퇴한 사용자' */
export interface OngiChatUserSummary {
  id: number;
  name: string;
  avatarUrl: string | null;
  deleted: boolean;
}

/** 내 대화방 목록의 한 줄 */
export interface OngiChatRoomRow {
  room: OngiChatRoom;
  me: OngiChatParticipant;
  /** 내가 볼 수 있는 마지막 메시지 */
  lastMessage: OngiChatMessage | null;
  unreadCount: number;
  /** 표시할 참여자 (나 포함, 참여 순) — 그룹방은 지금 참여 중인 사람, 1:1 은 두 사람 모두 */
  userIds: number[];
}

export interface IOngiChatRepository {
  findRoomById(roomId: number): Promise<OngiChatRoom | null>;
  findRoomByDirectKey(directKey: string): Promise<OngiChatRoom | null>;
  /** 방과 참여자를 한 번에 만든다. 같은 1:1 방이 동시에 만들어지면 unique 위반으로 실패한다 */
  createRoom(creator: OngiChatRoomCreator, userIds: number[]): Promise<OngiChatRoom>;

  findParticipant(roomId: number, userId: number): Promise<OngiChatParticipant | null>;
  /** 나간 사람까지 전부 (참여 순) */
  scanParticipants(roomId: number): Promise<OngiChatParticipant[]>;
  /** 새로 넣거나 나갔던 사람을 되살린다 — 지금 방의 마지막 메시지까지는 보이지 않는다 (DB 에서 그 순간 값을 읽는다) */
  addParticipants(roomId: number, userIds: number[]): Promise<void>;
  leave(roomId: number, userId: number): Promise<void>;
  /** 1:1 방 지우기 — messageId 까지의 메시지를 내게서 숨기고 읽음 처리 (새 메시지가 오면 목록에 다시 나타난다) */
  hideUntil(roomId: number, userId: number, messageId: number): Promise<void>;
  /** 읽음 위치를 앞으로만 옮긴다. 옮긴 뒤 값을 돌려준다 */
  markRead(roomId: number, userId: number, messageId: number): Promise<number>;
  /** 사용자의 모든 대화방에서 나간다 (회원 탈퇴) */
  leaveAllOfUser(userId: number): Promise<void>;

  /** 메시지를 저장하고 방의 마지막 메시지를 갱신한다 */
  createMessage(creator: OngiChatMessageCreator): Promise<OngiChatMessage>;
  findMessageById(messageId: number): Promise<OngiChatMessage | null>;
  /** visibleFromMessageId 보다 크고 beforeId 보다 작은 메시지, 최신 순 limit 개 — excludeSenderIds 가 보낸 메시지는 빼고 센다 */
  scanMessages(roomId: number, visibleFromMessageId: number, beforeId: number | null, limit: number, excludeSenderIds: number[]): Promise<OngiChatMessage[]>;

  /** 내가 참여 중이고 볼 메시지가 있는 방 — 마지막 메시지 최신 순 */
  scanRoomRows(userId: number): Promise<OngiChatRoomRow[]>;
  /** 참여 중인 모든 방의 안 읽은 메시지 수 합계 (시스템 메시지 제외) */
  countUnread(userId: number): Promise<number>;
  scanUserSummaries(userIds: number[]): Promise<OngiChatUserSummary[]>;
}
