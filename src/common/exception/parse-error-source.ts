/**
 * 스택트레이스에서 에러 발생 클래스명과 메서드명을 추출
 *
 * 예: "at AzeyoCreateCommunityPostUseCase.execute (/.../usecase.js:25:15)"
 *   → { className: "AzeyoCreateCommunityPostUseCase", methodName: "execute" }
 */
export function parseErrorSource(stack?: string): { className: string; methodName: string } {
  if (!stack) return { className: 'Unknown', methodName: 'Unknown' };

  const lines = stack.split('\n');

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    // "at ClassName.method (...)" 패턴
    const match = line.match(/^at\s+([A-Za-z0-9_$]+)\.([A-Za-z0-9_$]+)\s/);
    if (match) {
      // Object, Module, Function 등 내부 객체는 스킵
      if (['Object', 'Module', 'Function', 'Promise', 'process', 'async'].includes(match[1])) continue;
      return { className: match[1], methodName: match[2] };
    }

    // "at new ClassName (...)" 패턴 (생성자)
    const constructorMatch = line.match(/^at\s+new\s+([A-Za-z0-9_$]+)\s/);
    if (constructorMatch) {
      return { className: constructorMatch[1], methodName: 'constructor' };
    }
  }

  return { className: 'Unknown', methodName: 'Unknown' };
}
