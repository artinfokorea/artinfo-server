import { SerialQueue } from './serial-queue';

/**
 * 스펙: Polaris Office 는 GUI 를 한 번에 하나만 안전하게 조작할 수 있으므로 변환 요청을 직렬화한다.
 * 1) 등록 순서대로 하나씩 실행 2) 앞 작업이 실패해도 뒤 작업은 실행 3) 대기 수(size) 가 정확
 */
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

describe('SerialQueue', () => {
  it('작업을 등록 순서대로 하나씩 실행한다', async () => {
    const q = new SerialQueue();
    const order: string[] = [];
    const a = q.run(async () => {
      order.push('a-start');
      await sleep(30);
      order.push('a-end');
      return 'A';
    });
    const b = q.run(async () => {
      order.push('b-start');
      order.push('b-end');
      return 'B';
    });
    expect(q.size).toBe(2);
    expect(await Promise.all([a, b])).toEqual(['A', 'B']);
    expect(order).toEqual(['a-start', 'a-end', 'b-start', 'b-end']);
    expect(q.size).toBe(0);
  });

  it('앞 작업이 실패해도 뒤 작업은 실행된다', async () => {
    const q = new SerialQueue();
    const failing = q.run(async () => {
      throw new Error('boom');
    });
    const next = q.run(async () => 42);
    await expect(failing).rejects.toThrow('boom');
    expect(await next).toBe(42);
  });
});
