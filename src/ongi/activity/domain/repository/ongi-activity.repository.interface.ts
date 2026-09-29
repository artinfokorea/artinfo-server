import { OngiActivityPlatform } from '@/ongi/activity/domain/service/ongi-activity-policy';

export const ONGI_ACTIVITY_REPOSITORY = Symbol('ONGI_ACTIVITY_REPOSITORY');

export interface OngiActivityPing {
  userId: number;
  seconds: number;
  sessions: number;
  platform: OngiActivityPlatform | null;
  appVersion: string | null;
}

export interface IOngiActivityRepository {
  /**
   * 오늘(한국 시간) 접속했음을 기록 — 그 토큰이 온기 세션(ongi_auths)의 것이고 탈퇴하지 않은 사용자일 때만.
   * 서버의 여러 서비스가 같은 JWT 키를 쓰므로 토큰 id 만 믿지 않는다.
   */
  touch(userId: number, accessToken: string): Promise<void>;
  /** 앱이 보낸 사용 시간·방문 수를 오늘 행에 더한다 */
  addPing(ping: OngiActivityPing): Promise<void>;
}
