import { naturalCompare } from './natural-compare';

describe('naturalCompare', () => {
  it('숫자 구간은 수로 비교한다', () => {
    expect(['page-10.png', 'page-2.png', 'page-1.png'].sort(naturalCompare)).toEqual(['page-1.png', 'page-2.png', 'page-10.png']);
  });
  it('0 패딩이 있어도 순서가 같다', () => {
    expect(['page-10.png', 'page-02.png', 'page-01.png'].sort(naturalCompare)).toEqual(['page-01.png', 'page-02.png', 'page-10.png']);
  });
});
