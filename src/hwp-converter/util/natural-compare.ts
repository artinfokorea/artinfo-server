/** doc_0002 가 doc_0010 앞에 오도록 숫자가 섞인 파일명을 자연 정렬한다 */
export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}
