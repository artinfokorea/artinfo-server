import { ApiProperty } from '@nestjs/swagger';
import { signOngiMediaUrl } from '@/ongi/common/ongi-media-url';
import { OngiChatUserSummary } from '@/ongi/chat/domain/repository/ongi-chat.repository.interface';
import { OngiChatMessage } from '@/ongi/chat/domain/entity/ongi-chat-message.entity';
import { messagePreviewOf } from '@/ongi/chat/domain/service/ongi-chat-policy';
import { OngiChatMessageView, OngiChatParticipantView, OngiChatRoomListItem, OngiChatRoomView } from '@/ongi/chat/application/usecase/ongi-chat.usecase';

export class OngiChatUserResponse {
  @ApiProperty({ type: String, description: '사용자 id' }) id: string;
  @ApiProperty({ type: String, description: '이름 (탈퇴한 사용자는 "탈퇴한 사용자")' }) name: string;
  @ApiProperty({ type: String, required: false, description: '프로필 사진' }) avatarUrl?: string;
  @ApiProperty({ type: Boolean, description: '탈퇴한 사용자인지' }) deleted: boolean;
  @ApiProperty({ type: Boolean, required: false, description: '나인지 (참여자 목록에서만)' }) isMe?: boolean;

  constructor(user: OngiChatUserSummary | OngiChatParticipantView) {
    this.id = String(user.id);
    this.name = user.name;
    this.avatarUrl = signOngiMediaUrl(user.avatarUrl) ?? undefined;
    this.deleted = user.deleted;
    if ('isMe' in user) this.isMe = user.isMe;
  }
}

export class OngiChatRoomResponse {
  @ApiProperty({ type: String, description: '대화방 id' }) id: string;
  @ApiProperty({ type: String, enum: ['direct', 'group'], description: '1:1 · 그룹' }) type: string;
  @ApiProperty({ type: String, required: false, description: '정한 방 이름 (그룹방만)' }) name?: string;
  @ApiProperty({ type: String, description: '보여줄 제목 — 이름, 없으면 나를 뺀 참여자 이름' }) title: string;
  @ApiProperty({ type: [OngiChatUserResponse], description: '참여자 (나 포함, 참여 순)' }) participants: OngiChatUserResponse[];
  @ApiProperty({ type: Boolean, description: '메시지를 보낼 수 있는지 (1:1 에서 차단·탈퇴면 false)' }) canSend: boolean;

  constructor(view: OngiChatRoomView) {
    this.id = String(view.room.id);
    this.type = view.room.type;
    this.name = view.room.name ?? undefined;
    this.title = view.title;
    this.participants = view.participants.map(p => new OngiChatUserResponse(p));
    this.canSend = view.canSend;
  }
}

export class OngiChatLastMessageResponse {
  @ApiProperty({ type: String, description: '메시지 id' }) id: string;
  @ApiProperty({ type: String, enum: ['text', 'photo', 'system'] }) type: string;
  @ApiProperty({ type: String, description: '목록에 보일 한 줄 (사진은 "사진")' }) preview: string;
  @ApiProperty({ type: String, required: false, description: '보낸 사람 id (시스템 메시지는 없음)' }) senderId?: string;
  @ApiProperty({ type: String, description: '보낸 시각 (ISO)' }) createdAt: string;

  constructor(message: OngiChatMessage) {
    this.id = String(message.id);
    this.type = message.type;
    this.preview = messagePreviewOf(message.type, message.content);
    this.senderId = message.senderUserId === null ? undefined : String(message.senderUserId);
    this.createdAt = new Date(message.createdAt).toISOString();
  }
}

export class OngiChatRoomListItemResponse {
  @ApiProperty({ type: String, description: '대화방 id' }) id: string;
  @ApiProperty({ type: String, enum: ['direct', 'group'] }) type: string;
  @ApiProperty({ type: String, description: '보여줄 제목' }) title: string;
  @ApiProperty({ type: [OngiChatUserResponse], description: '참여자 (나 포함)' }) participants: OngiChatUserResponse[];
  @ApiProperty({ type: OngiChatLastMessageResponse, required: false }) lastMessage?: OngiChatLastMessageResponse;
  @ApiProperty({ type: Number, description: '안 읽은 메시지 수' }) unreadCount: number;

  constructor(item: OngiChatRoomListItem) {
    this.id = String(item.room.id);
    this.type = item.room.type;
    this.title = item.title;
    this.participants = item.participants.map(p => new OngiChatUserResponse(p));
    this.lastMessage = item.lastMessage ? new OngiChatLastMessageResponse(item.lastMessage) : undefined;
    this.unreadCount = item.unreadCount;
  }
}

export class OngiChatRoomListResponse {
  @ApiProperty({ type: [OngiChatRoomListItemResponse], description: '내 대화방 (마지막 메시지 최신 순)' }) rooms: OngiChatRoomListItemResponse[];

  constructor(items: OngiChatRoomListItem[]) {
    this.rooms = items.map(item => new OngiChatRoomListItemResponse(item));
  }
}

export class OngiChatMessageResponse {
  @ApiProperty({ type: String, description: '메시지 id' }) id: string;
  @ApiProperty({ type: String, description: '대화방 id' }) roomId: string;
  @ApiProperty({ type: String, enum: ['text', 'photo', 'system'] }) type: string;
  @ApiProperty({ type: String, description: '글 · 시스템 문구 (사진은 빈 문자열)' }) content: string;
  @ApiProperty({ type: String, required: false, description: '사진 원본' }) mediaUrl?: string;
  @ApiProperty({ type: String, required: false, description: '사진 축소본' }) thumbUrl?: string;
  @ApiProperty({ type: Number, description: '사진 가로/세로 비율' }) aspectRatio: number;
  @ApiProperty({ type: OngiChatUserResponse, required: false, description: '보낸 사람 (시스템 메시지는 없음)' }) sender?: OngiChatUserResponse;
  @ApiProperty({ type: Boolean, description: '내가 보낸 메시지인지' }) isMine: boolean;
  @ApiProperty({ type: Number, description: '아직 안 읽은 사람 수 (보낸 사람 제외)' }) unreadCount: number;
  @ApiProperty({ type: String, description: '보낸 시각 (ISO)' }) createdAt: string;

  constructor(view: OngiChatMessageView) {
    const { message } = view;
    this.id = String(message.id);
    this.roomId = String(message.roomId);
    this.type = message.type;
    this.content = message.content;
    this.mediaUrl = signOngiMediaUrl(message.mediaUrl) ?? undefined;
    this.thumbUrl = signOngiMediaUrl(message.thumbUrl) ?? undefined;
    this.aspectRatio = Number(message.aspectRatio ?? 1);
    this.sender = view.sender ? new OngiChatUserResponse(view.sender) : undefined;
    this.isMine = view.isMine;
    this.unreadCount = view.unreadCount;
    this.createdAt = new Date(message.createdAt).toISOString();
  }
}

export class OngiChatMessageListResponse {
  @ApiProperty({ type: [OngiChatMessageResponse], description: '메시지 (최신 순) — 비어 있으면 더 없음' }) messages: OngiChatMessageResponse[];

  constructor(views: OngiChatMessageView[]) {
    this.messages = views.map(view => new OngiChatMessageResponse(view));
  }
}

export class OngiChatUnreadCountResponse {
  @ApiProperty({ type: Number, description: '참여 중인 모든 방의 안 읽은 메시지 수' }) count: number;

  constructor(count: number) {
    this.count = count;
  }
}
