export const ONGI_CHAT_REALTIME = Symbol('ONGI_CHAT_REALTIME');

/** 실시간 이벤트 — 앱은 이벤트를 받으면 해당 목록을 다시 불러온다 (내용은 싣지 않는다) */
export type OngiChatEvent = 'chat:message' | 'chat:read' | 'chat:room';

export interface IOngiChatRealtime {
  /** 접속 중인 사용자에게 보낸다 — 서버가 여러 대여도 전달되며, 실패해도 요청은 성공 */
  emit(userIds: number[], event: OngiChatEvent, payload: Record<string, string>): void;
}
