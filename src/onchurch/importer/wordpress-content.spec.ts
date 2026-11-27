import {
  htmlToText,
  extractYoutubeUrl,
  extractImageUrls,
  toOriginalImageUrl,
  sermonDateFromTitle,
  decodeEntities,
} from '@/onchurch/importer/wordpress-content';

// 워드프레스 글(HTML)을 온교회 글(평문)로 옮기는 변환.
// 기대: 문단·줄바꿈은 살리고 태그는 지운다 / 링크 글자와 주소가 다르면 주소를 괄호로 남긴다 /
// 유튜브 주소는 watch 주소 하나로 / 사진은 원본 크기 주소로, 중복 없이 / 설교 날짜는 제목의 "11월 22일"을 쓴다.
describe('wordpress-content', () => {
  it('문단과 줄바꿈을 살리고 태그·엔티티를 정리한다', () => {
    const html = '<p>첫 문단&nbsp;입니다.</p>\n<p>둘째 줄<br />셋째 줄</p><div><strong>굵게</strong> &amp; 보통</div>';
    expect(htmlToText(html)).toBe('첫 문단 입니다.\n\n둘째 줄\n셋째 줄\n\n굵게 & 보통');
  });

  it('링크 글자와 주소가 다르면 주소를 남기고, 같으면 한 번만 쓴다', () => {
    expect(htmlToText('<p><a href="https://drive.google.com/x">주보 보기</a></p>')).toBe('주보 보기 (https://drive.google.com/x)');
    expect(htmlToText('<p><a href="https://drive.google.com/x">https://drive.google.com/x</a></p>')).toBe('https://drive.google.com/x');
  });

  it('스크립트·스타일·iframe 내용은 버리고 빈 줄은 두 줄까지만', () => {
    const html = '<style>.a{}</style><p>본문</p><p></p><p></p><iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe><script>x()</script><p>끝</p>';
    expect(htmlToText(html)).toBe('본문\n\n끝');
  });

  it('내용 없는 목록 항목(• 만 남는 줄)은 지운다', () => {
    expect(htmlToText('<ul><li></li></ul><p>본문</p><ul><li>항목</li></ul>')).toBe('본문\n\n• 항목');
  });

  it('제목의 HTML 엔티티를 푼다', () => {
    expect(decodeEntities('설교 &#8211; &lsquo;은혜&rsquo; &amp; 평강 &#038; 기쁨')).toBe('설교 – ‘은혜’ & 평강 & 기쁨');
  });

  it('유튜브 embed·watch·youtu.be 주소에서 첫 영상을 watch 주소로', () => {
    expect(extractYoutubeUrl('<iframe src="https://www.youtube.com/embed/kWQ4OOTUysA?feature=oembed"></iframe>')).toBe(
      'https://www.youtube.com/watch?v=kWQ4OOTUysA',
    );
    expect(extractYoutubeUrl('<a href="https://youtu.be/Gm9nDGhzTcw">영상</a>')).toBe('https://www.youtube.com/watch?v=Gm9nDGhzTcw');
    expect(extractYoutubeUrl('<p>영상 없음</p>')).toBeNull();
  });

  it('사진은 원본 크기 주소로 바꾸고 중복을 뺀다', () => {
    const html =
      '<img src="http://chambit.org/wp-content/uploads/2023/10/a-300x200.jpg" />' +
      '<img src="http://chambit.org/wp-content/uploads/2023/10/a.jpg" />' +
      '<img src="http://chambit.org/wp-content/uploads/2023/10/b-1024x768.png">' +
      '<img src="data:image/gif;base64,AAA">';
    expect(extractImageUrls(html)).toEqual(['http://chambit.org/wp-content/uploads/2023/10/a.jpg', 'http://chambit.org/wp-content/uploads/2023/10/b.png']);
    expect(toOriginalImageUrl('http://x.org/wp-content/uploads/c-150x150.jpeg?v=1')).toBe('http://x.org/wp-content/uploads/c.jpeg');
  });

  it('설교 날짜는 제목의 "M월 D일"을 글 쓴 해 기준으로, 없으면 글 쓴 날', () => {
    expect(sermonDateFromTitle('영광의 보좌(11월 22일 주일 예배 설교)', '2026-11-26T08:00:00')).toBe('2026-11-22');
    expect(sermonDateFromTitle('하나님의 지혜 (2025년 3월 2일 주일 오후 예배 설교)', '2026-01-10T08:00:00')).toBe('2025-03-02');
    // 1월 초에 올린 지난해 12월 설교
    expect(sermonDateFromTitle('송구영신 (12월 31일 예배)', '2026-01-03T08:00:00')).toBe('2025-12-31');
    expect(sermonDateFromTitle('제목에 날짜 없음', '2026-11-17T09:30:00')).toBe('2026-11-17');
  });
});
