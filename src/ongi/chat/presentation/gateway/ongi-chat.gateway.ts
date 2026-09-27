import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { DataSource } from 'typeorm';
import type { Namespace, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { OngiChatRealtimeService, ongiChatUserRoom } from '@/ongi/chat/application/service/ongi-chat-realtime.service';

/**
 * 채팅 실시간 소켓 — 접속하면 `user:{id}` 방에 넣고, 서버는 이벤트(chat:message · chat:read · chat:room)만 보낸다.
 * 내용은 싣지 않으므로 앱은 이벤트를 받으면 REST 로 다시 불러온다.
 * 인증: access token 서명 + ongi_auths 세션 확인 (다른 서비스가 같은 키로 발급한 토큰 차단).
 * 토큰이 만료되는 순간 연결을 끊는다 — 로그아웃·세션 만료 뒤에도 이벤트를 계속 받지 않게 (앱은 새 토큰으로 다시 붙는다).
 * 서버가 2대라 앱은 transports: ['websocket'] 로만 붙는다 (polling 은 sticky session 이 필요).
 */
@WebSocketGateway({ namespace: '/ongi-chat', cors: { origin: '*' } })
export class OngiChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OngiChatGateway.name);
  private readonly expiryTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    private readonly realtime: OngiChatRealtimeService,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  afterInit(namespace: Namespace): void {
    this.realtime.attach(namespace);
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = String(client.handshake.auth?.token ?? '');
      if (!token) throw new Error('no token');

      const decoded = jwt.verify(token, process.env['JWT_TOKEN_KEY'] as string) as { id?: number; exp?: number };
      const userId = Number(decoded.id);
      const [session] = await this.dataSource.query(
        `SELECT 1 FROM ongi_auths a JOIN ongi_users u ON u.id = a.user_id
          WHERE a.access_token = $1 AND a.user_id = $2 AND u.deleted_at IS NULL LIMIT 1`,
        [token, userId],
      );
      if (!session) throw new Error('no session');

      await client.join(ongiChatUserRoom(userId));
      if (decoded.exp) {
        const timer = setTimeout(() => client.disconnect(true), Math.max(0, decoded.exp * 1000 - Date.now()));
        this.expiryTimers.set(client.id, timer);
      }
    } catch (error) {
      this.logger.debug(`chat socket rejected: ${error instanceof Error ? error.message : String(error)}`);
      client.emit('chat:unauthorized');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const timer = this.expiryTimers.get(client.id);
    if (timer) clearTimeout(timer);
    this.expiryTimers.delete(client.id);
  }
}
