export const ONGI_BLOCK_REPOSITORY = Symbol('ONGI_BLOCK_REPOSITORY');

export interface IOngiBlockRepository {
  /** 내가 차단한 사용자 id 목록 */
  blockedUserIdsOf(userId: number): Promise<number[]>;
  /** 차단 — 이미 차단돼 있으면 아무 일도 하지 않는다 */
  block(userId: number, blockedUserId: number): Promise<void>;
  /** 차단 해제 — 차단돼 있지 않아도 정상 처리 */
  unblock(userId: number, blockedUserId: number): Promise<void>;
}
