import { Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OngiChatUseCase } from '@/ongi/chat/application/usecase/ongi-chat.usecase';
import {
  OngiCreateChatRoomRequest,
  OngiInviteChatRequest,
  OngiReadChatRequest,
  OngiSendChatMessageRequest,
} from '@/ongi/chat/presentation/dto/request/ongi-chat.request';
import {
  OngiChatMessageListResponse,
  OngiChatMessageResponse,
  OngiChatRoomListResponse,
  OngiChatRoomResponse,
  OngiChatUnreadCountResponse,
} from '@/ongi/chat/presentation/dto/response/ongi-chat.response';

const DEFAULT_PAGE_SIZE = 30;

@RestApiController('/ongi/chat', 'Ongi Chat')
export class OngiChatController {
  constructor(private readonly chatUseCase: OngiChatUseCase) {}

  @RestApiGet(OngiChatRoomListResponse, { path: '/rooms', description: '내 대화방 목록 (마지막 메시지 최신 순)', auth: [USER_TYPE.CLIENT] })
  async scanRooms(@AuthSignature() signature: UserSignature) {
    return new OngiChatRoomListResponse(await this.chatUseCase.scanRooms(signature.id));
  }

  @RestApiGet(OngiChatUnreadCountResponse, { path: '/unread-count', description: '안 읽은 메시지 수 (헤더 배지)', auth: [USER_TYPE.CLIENT] })
  async countUnread(@AuthSignature() signature: UserSignature) {
    return new OngiChatUnreadCountResponse(await this.chatUseCase.countUnread(signature.id));
  }

  @RestApiPost(OngiChatRoomResponse, { path: '/rooms', description: '대화 시작 — 1명이면 1:1(있으면 그 방), 2명 이상이면 그룹방', auth: [USER_TYPE.CLIENT] })
  async createRoom(@AuthSignature() signature: UserSignature, @Body() request: OngiCreateChatRoomRequest) {
    return new OngiChatRoomResponse(await this.chatUseCase.createRoom(signature.id, { memberIds: request.toMemberIds(), name: request.name }));
  }

  @RestApiGet(OngiChatRoomResponse, { path: '/rooms/:roomId', description: '대화방 상세', auth: [USER_TYPE.CLIENT] })
  async getRoom(@AuthSignature() signature: UserSignature, @Param('roomId', ParseIntPipe) roomId: number) {
    return new OngiChatRoomResponse(await this.chatUseCase.getRoom(signature.id, roomId));
  }

  @RestApiGet(OngiChatMessageListResponse, {
    path: '/rooms/:roomId/messages',
    description: '메시지 (최신 순, before 로 이전 페이지)',
    auth: [USER_TYPE.CLIENT],
  })
  async scanMessages(
    @AuthSignature() signature: UserSignature,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('before') before?: string,
    @Query('limit') limit?: string,
  ) {
    const beforeId = before && Number(before) > 0 ? Number(before) : null;
    const size = limit && Number(limit) > 0 ? Number(limit) : DEFAULT_PAGE_SIZE;

    return new OngiChatMessageListResponse(await this.chatUseCase.scanMessages(signature.id, roomId, beforeId, size));
  }

  @RestApiPost(OngiChatMessageResponse, { path: '/rooms/:roomId/messages', description: '메시지 보내기 (글 · 사진)', auth: [USER_TYPE.CLIENT] })
  async sendMessage(@AuthSignature() signature: UserSignature, @Param('roomId', ParseIntPipe) roomId: number, @Body() request: OngiSendChatMessageRequest) {
    return new OngiChatMessageResponse(await this.chatUseCase.sendMessage(signature.id, roomId, request));
  }

  @RestApiPost(OkResponse, { path: '/rooms/:roomId/read', description: '여기까지 읽음', auth: [USER_TYPE.CLIENT] })
  async read(@AuthSignature() signature: UserSignature, @Param('roomId', ParseIntPipe) roomId: number, @Body() request: OngiReadChatRequest) {
    await this.chatUseCase.read(signature.id, roomId, Number(request.messageId));

    return new OkResponse();
  }

  @RestApiPost(OngiChatRoomResponse, { path: '/rooms/:roomId/invite', description: '그룹방에 초대 (참여자 누구나)', auth: [USER_TYPE.CLIENT] })
  async invite(@AuthSignature() signature: UserSignature, @Param('roomId', ParseIntPipe) roomId: number, @Body() request: OngiInviteChatRequest) {
    return new OngiChatRoomResponse(await this.chatUseCase.invite(signature.id, roomId, request.toMemberIds()));
  }

  @RestApiPost(OkResponse, { path: '/rooms/:roomId/leave', description: '그룹방 나가기 · 1:1 방은 내 목록에서 지우기', auth: [USER_TYPE.CLIENT] })
  async leave(@AuthSignature() signature: UserSignature, @Param('roomId', ParseIntPipe) roomId: number) {
    await this.chatUseCase.leave(signature.id, roomId);

    return new OkResponse();
  }
}
