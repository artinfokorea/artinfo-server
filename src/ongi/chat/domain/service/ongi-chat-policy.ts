export const ONGI_CHAT_TEXT_MAX_LENGTH = 1000;
export const ONGI_CHAT_ROOM_NAME_MAX_LENGTH = 30;
/** 그룹방 최대 인원 (나 포함) */
export const ONGI_CHAT_MAX_PARTICIPANTS = 50;
const PREVIEW_MAX_LENGTH = 100;

export type OngiChatRoomType = 'direct' | 'group';
export type OngiChatMessageType = 'text' | 'photo' | 'system';

/** 메시지 본문 — 앞뒤 공백을 걷어내고, 비었거나 1000자를 넘으면 null */
export function normalizeChatText(raw: string | undefined | null): string | null {
  const text = (raw ?? '').trim();
  if (text.length === 0 || text.length > ONGI_CHAT_TEXT_MAX_LENGTH) return null;

  return text;
}

/** 그룹방 이름 — 비우면 { name: null }(참여자 이름으로 표시), 30자를 넘으면 null(거부) */
export function normalizeRoomName(raw: string | undefined | null): { name: string | null } | null {
  const text = (raw ?? '').trim();
  if (text.length > ONGI_CHAT_ROOM_NAME_MAX_LENGTH) return null;

  return { name: text.length > 0 ? text : null };
}

/** 두 사람의 1:1 방 키 — 작은 id 가 앞이라 누가 먼저 만들어도 같다 */
export function directKeyOf(userIdA: number, userIdB: number): string {
  return `${Math.min(userIdA, userIdB)}:${Math.max(userIdA, userIdB)}`;
}

/**
 * 고른 구성원(공간별 레코드)을 초대할 사용자 id 로 바꾼다 — 중복·나 자신 제외, 고른 순서 유지.
 * 내가 속하지 않은 공간의 구성원이 하나라도 섞이면 outsider.
 */
export function inviteTargetsOf(
  requesterUserId: number,
  targets: { userId: number; groupId: number }[],
  myGroupIds: number[],
): { userIds: number[]; outsider: boolean } {
  const mine = new Set(myGroupIds);
  const outsider = targets.some(target => !mine.has(target.groupId));
  const userIds = [...new Set(targets.map(target => target.userId))].filter(userId => userId !== requesterUserId);

  return { userIds, outsider };
}

export interface OngiChatReadState {
  userId: number;
  lastReadMessageId: number;
  /** 이 id 이하 메시지는 볼 수 없다 (초대 전 메시지 · 1:1 방을 지운 뒤) */
  visibleFromMessageId: number;
  left: boolean;
}

/** 메시지 옆 숫자 — 보낸 사람을 뺀, 이 메시지를 볼 수 있는 참여자 중 아직 안 읽은 사람 수 */
export function unreadCountOf(message: { id: number; senderUserId: number | null }, participants: OngiChatReadState[]): number {
  if (message.senderUserId === null) return 0;

  return participants.filter(p => p.userId !== message.senderUserId && !p.left && p.visibleFromMessageId < message.id && p.lastReadMessageId < message.id)
    .length;
}

/** 방 제목 — 정한 이름이 있으면 그것, 없으면 나를 뺀 참여자 이름 3명까지 + "외 N명" */
export function roomTitleOf(customName: string | null, otherNames: string[]): string {
  if (customName) return customName;
  if (otherNames.length === 0) return '대화 상대 없음';
  if (otherNames.length <= 3) return otherNames.join(', ');

  return `${otherNames.slice(0, 3).join(', ')} 외 ${otherNames.length - 3}명`;
}

/** 목록·푸시에 보일 한 줄 — 사진은 "사진", 줄바꿈은 공백, 100자 넘으면 … */
export function messagePreviewOf(type: OngiChatMessageType | string, content: string): string {
  if (type === 'photo') return '사진';
  const line = content.replace(/\s*\n\s*/g, ' ');

  return line.length > PREVIEW_MAX_LENGTH ? `${line.slice(0, PREVIEW_MAX_LENGTH)}…` : line;
}

/** 새 메시지 푸시 — 1:1 은 보낸 사람이 제목, 그룹은 방 제목 + "보낸 사람: 내용" */
export function chatPushOf(params: {
  roomType: OngiChatRoomType | string;
  roomTitle: string;
  senderName: string;
  messageType: OngiChatMessageType | string;
  content: string;
}): { title: string; body: string } {
  const preview = messagePreviewOf(params.messageType, params.content);
  if (params.roomType === 'direct') return { title: params.senderName, body: preview };

  return { title: params.roomTitle, body: `${params.senderName}: ${preview}` };
}

export const createdSystemText = (creatorName: string) => `${creatorName}님이 대화방을 만들었어요`;
export const invitedSystemText = (inviterName: string, invitedNames: string[]) =>
  `${inviterName}님이 ${invitedNames.map(name => `${name}님`).join(', ')}을 초대했어요`;
export const leftSystemText = (name: string) => `${name}님이 나갔어요`;

/** 사진 메시지 URL — 우리 S3 버킷의 온기 경로(/ongi/)만 허용 (임의 외부 링크 방지) */
export function isOngiMediaUrl(url: string | undefined | null): boolean {
  if (!url) return false;

  return /^https:\/\/[a-z0-9.-]+\.s3\.[a-z0-9-]+\.amazonaws\.com\/(?:[^?#]*\/)?ongi\//.test(url);
}
