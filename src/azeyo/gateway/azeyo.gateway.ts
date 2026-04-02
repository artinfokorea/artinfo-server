import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

interface JwtPayload {
  id: number;
}

@WebSocketGateway({
  namespace: '/azeyo',
  cors: { origin: '*' },
})
export class AzeyoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('AzeyoGateway');

  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(AzeyoUser)
    private readonly userRepository: Repository<AzeyoUser>,
  ) {}

  // userId → Set<socketId> (한 유저가 여러 탭 접속 가능)
  private onlineUsers = new Map<number, Set<string>>();
  // socketId → userId
  private socketUserMap = new Map<string, number>();

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) { client.disconnect(); return; }

      const decoded = jwt.verify(token as string, process.env['JWT_TOKEN_KEY'] as string) as JwtPayload;
      const userId = decoded.id;
      this.logger.log(`Socket connected: userId=${userId}, socketId=${client.id}`);

      this.socketUserMap.set(client.id, userId);

      const wasOffline = !this.onlineUsers.has(userId);
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)!.add(client.id);

      client.join(`user:${userId}`);

      // 첫 연결 시 DB 업데이트
      if (wasOffline) {
        await this.userRepository.update(userId, { isOnline: true });
      }
    } catch (error) {
      this.logger.error(`Socket auth failed: ${error instanceof Error ? error.message : error}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) return;
    this.logger.log(`Socket disconnected: userId=${userId}, socketId=${client.id}`);

    const sockets = this.onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.onlineUsers.delete(userId);
        // 모든 연결 끊어지면 오프라인 처리
        await this.userRepository.update(userId, { isOnline: false, lastSeenAt: new Date() });
      }
    }
    this.socketUserMap.delete(client.id);
  }

  /**
   * 특정 유저에게 실시간 알림 전송
   */
  sendNotificationToUser(userId: number, notification: {
    id: number;
    type: string;
    title: string;
    body: string;
    referenceId: string | null;
    createdAt: Date;
  }) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
