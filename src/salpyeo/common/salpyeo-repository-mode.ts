/**
 * 로컬에서 Postgres 없이 확인할 때 `SALPYEO_REPOSITORY=memory` 로 인메모리 저장소를 쓴다.
 * 배포 워크플로는 이 변수를 주입하지 않으므로 운영은 항상 Postgres 다.
 */
export function isSalpyeoMemoryRepository(): boolean {
  return process.env['SALPYEO_REPOSITORY'] === 'memory';
}
