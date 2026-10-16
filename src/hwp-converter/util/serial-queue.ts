/**
 * Polaris Office 는 단일 인스턴스 GUI 앱이라 자동화를 한 번에 하나만 돌릴 수 있다.
 * 변환 요청을 직렬화하는 단순 뮤텍스 큐.
 */
export class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve();
  private pending = 0;

  get size(): number {
    return this.pending;
  }

  run<T>(task: () => Promise<T>): Promise<T> {
    this.pending += 1;
    const next = this.tail.then(task, task);
    this.tail = next
      .catch(() => undefined)
      .finally(() => {
        this.pending -= 1;
      });
    return next;
  }
}
