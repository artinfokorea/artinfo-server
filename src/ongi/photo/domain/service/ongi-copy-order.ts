/**
 * 여러 장을 다른 공간에 복사할 때의 생성 순서 — 원본 게시 순서(오래된 것부터).
 *
 * 앱은 선택 순서(전체 선택이면 최신 순)로 id 를 보내고 서버는 받은 순서대로 하나씩 만든다.
 * 그대로 두면 원본에서 최신이던 사진이 가장 먼저 생성돼 대상 공간에서는 가장 오래된 것으로 뒤집혀 보인다.
 * 피드 정렬 기준(created_at, id)과 같은 키로 오름차순 정렬해 만들면 대상 공간에서도 원본과 같은 순서가 된다.
 */
export function inOriginalOrder<T extends { id: number; createdAt: Date }>(photos: T[]): T[] {
  return [...photos].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id - b.id);
}
