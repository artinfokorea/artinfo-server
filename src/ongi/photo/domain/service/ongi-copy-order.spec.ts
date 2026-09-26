import { inOriginalOrder } from '@/ongi/photo/domain/service/ongi-copy-order';

const at = (iso: string) => new Date(iso);

describe('inOriginalOrder — 여러 장 복사할 때 원본 게시 순서(오래된 것부터)로 만든다', () => {
  it('앱이 최신 순으로 보내도 오래된 것부터 정렬된다', () => {
    const photos = [
      { id: 30, createdAt: at('2026-09-03T00:00:00Z') },
      { id: 20, createdAt: at('2026-09-02T00:00:00Z') },
      { id: 10, createdAt: at('2026-09-01T00:00:00Z') },
    ];
    expect(inOriginalOrder(photos).map(p => p.id)).toEqual([10, 20, 30]);
  });

  it('선택한 순서가 뒤섞여 있어도 결과는 같다', () => {
    const photos = [
      { id: 20, createdAt: at('2026-09-02T00:00:00Z') },
      { id: 10, createdAt: at('2026-09-01T00:00:00Z') },
      { id: 30, createdAt: at('2026-09-03T00:00:00Z') },
    ];
    expect(inOriginalOrder(photos).map(p => p.id)).toEqual([10, 20, 30]);
  });

  it('같은 시각(한 번에 올린 사진)은 id 오름차순 — 피드가 (created_at, id) 로 정렬하는 것과 같은 기준', () => {
    const photos = [
      { id: 12, createdAt: at('2026-09-01T00:00:00Z') },
      { id: 11, createdAt: at('2026-09-01T00:00:00Z') },
      { id: 13, createdAt: at('2026-09-01T00:00:00Z') },
    ];
    expect(inOriginalOrder(photos).map(p => p.id)).toEqual([11, 12, 13]);
  });

  it('원본 배열은 바꾸지 않는다', () => {
    const photos = [
      { id: 2, createdAt: at('2026-09-02T00:00:00Z') },
      { id: 1, createdAt: at('2026-09-01T00:00:00Z') },
    ];
    inOriginalOrder(photos);
    expect(photos.map(p => p.id)).toEqual([2, 1]);
  });
});
