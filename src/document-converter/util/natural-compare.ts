/** 숫자 구간을 수로 비교하는 정렬 — page-2.png 가 page-10.png 앞에 온다. */
export function naturalCompare(a: string, b: string): number {
  const re = /(\d+)|(\D+)/g;
  const ta = a.match(re) ?? [];
  const tb = b.match(re) ?? [];
  const n = Math.min(ta.length, tb.length);
  for (let i = 0; i < n; i++) {
    const x = ta[i];
    const y = tb[i];
    if (x === y) continue;
    const nx = /^\d+$/.test(x);
    const ny = /^\d+$/.test(y);
    if (nx && ny) {
      const d = Number(x) - Number(y);
      if (d !== 0) return d;
      continue;
    }
    return x < y ? -1 : 1;
  }
  return ta.length - tb.length;
}
