import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as Redis from 'ioredis';
import type { Namespace } from 'socket.io';
import { IOngiChatRealtime, OngiChatEvent } from '@/ongi/chat/domain/repository/ongi-chat-realtime.interface';

const CHANNEL = 'ongi:chat:events';

interface OngiChatEnvelope {
  userIds: number[];
  event: OngiChatEvent;
  payload: Record<string, string>;
}

export const ongiChatUserRoom = (userId: number) => `user:${userId}`;

/**
 * 실시간 전달 — 서버가 컨테이너 2대라 소켓이 어느 쪽에 붙었는지 모른다.
 * 이벤트를 Redis 채널에 발행하고, 각 서버가 구독해서 자기에게 붙은 소켓에만 보낸다.
 * Redis 가 없거나 끊기면 이 서버의 소켓에만 보낸다 (앱은 화면 진입·푸시 때 다시 불러오므로 치명적이지 않다).
 */
@Injectable()
export class OngiChatRealtimeService implements IOngiChatRealtime, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OngiChatRealtimeService.name);
  private publisher: Redis.Redis | null = null;
  private subscriber: Redis.Redis | null = null;
  private namespace: Namespace | null = null;

  onModuleInit(): void {
    const options = { host: process.env['REDIS_HOST'], port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10), maxRetriesPerRequest: 3 };
    this.publisher = new Redis.Redis(options);
    this.subscriber = new Redis.Redis(options);
    const onError = (error: Error) => this.logger.warn(`chat redis: ${error.message}`);
    this.publisher.on('error', onError);
    this.subscriber.on('error', onError);

    this.subscriber.subscribe(CHANNEL).catch(onError);
    this.subscriber.on('message', (channel, raw) => {
      if (channel !== CHANNEL) return;
      try {
        this.deliverLocally(JSON.parse(raw) as OngiChatEnvelope);
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.allSettled([this.publisher?.quit(), this.subscriber?.quit()]);
  }

  /** 게이트웨이가 뜨면 소켓 네임스페이스를 넘겨준다 */
  attach(namespace: Namespace): void {
    this.namespace = namespace;
  }

  emit(userIds: number[], event: OngiChatEvent, payload: Record<string, string>): void {
    const envelope: OngiChatEnvelope = { userIds: [...new Set(userIds)], event, payload };
    if (envelope.userIds.length === 0) return;

    if (this.publisher?.status !== 'ready') {
      this.deliverLocally(envelope);
      return;
    }
    this.publisher.publish(CHANNEL, JSON.stringify(envelope)).catch(() => this.deliverLocally(envelope));
  }

  private deliverLocally(envelope: OngiChatEnvelope): void {
    if (!this.namespace) return;
    this.namespace.to(envelope.userIds.map(ongiChatUserRoom)).emit(envelope.event, envelope.payload);
  }
}
