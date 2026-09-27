import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiChatRoom } from '@/ongi/chat/domain/entity/ongi-chat-room.entity';
import { OngiChatParticipant } from '@/ongi/chat/domain/entity/ongi-chat-participant.entity';
import { OngiChatMessage } from '@/ongi/chat/domain/entity/ongi-chat-message.entity';
import { ONGI_CHAT_REPOSITORY } from '@/ongi/chat/domain/repository/ongi-chat.repository.interface';
import { ONGI_CHAT_REALTIME } from '@/ongi/chat/domain/repository/ongi-chat-realtime.interface';
import { OngiChatRepository } from '@/ongi/chat/infrastructure/repository/ongi-chat.repository';
import { OngiChatRealtimeService } from '@/ongi/chat/application/service/ongi-chat-realtime.service';
import { OngiChatUseCase } from '@/ongi/chat/application/usecase/ongi-chat.usecase';
import { OngiChatController } from '@/ongi/chat/presentation/controller/ongi-chat.controller';
import { OngiChatGateway } from '@/ongi/chat/presentation/gateway/ongi-chat.gateway';
import { OngiGroupModule } from '@/ongi/group/ongi-group.module';
import { OngiPushModule } from '@/ongi/push/ongi-push.module';

@Module({
  imports: [TypeOrmModule.forFeature([OngiChatRoom, OngiChatParticipant, OngiChatMessage]), OngiGroupModule, OngiPushModule],
  controllers: [OngiChatController],
  providers: [
    { provide: ONGI_CHAT_REPOSITORY, useClass: OngiChatRepository },
    OngiChatRealtimeService,
    { provide: ONGI_CHAT_REALTIME, useExisting: OngiChatRealtimeService },
    OngiChatUseCase,
    OngiChatGateway,
  ],
  exports: [ONGI_CHAT_REPOSITORY],
})
export class OngiChatModule {}
