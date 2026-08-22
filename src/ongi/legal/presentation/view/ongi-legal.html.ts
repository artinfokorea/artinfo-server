import { OngiLegalDoc } from '@/ongi/legal/domain/constant/ongi-legal.constant';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** 약관 본문(플레인 텍스트)을 읽기 쉬운 정적 HTML 페이지로 — 앱 스토어 심사용 공개 URL */
export function renderOngiLegalHtml(doc: OngiLegalDoc): string {
  const paragraphs = doc.body
    .split(/\n{2,}/)
    .map(block => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>온기 ${escapeHtml(doc.title)}</title>
<style>
  body { margin: 0; padding: 32px 20px 64px; background: #fff; color: #1f2226; font: 15px/1.75 -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; }
  main { max-width: 680px; margin: 0 auto; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  .meta { color: #7b8087; font-size: 13px; margin-bottom: 28px; }
  p { margin: 0 0 18px; white-space: normal; }
</style>
</head>
<body>
<main>
  <h1>온기 ${escapeHtml(doc.title)}</h1>
  <div class="meta">시행일 ${escapeHtml(doc.updatedAt)}</div>
  ${paragraphs}
</main>
</body>
</html>`;
}
