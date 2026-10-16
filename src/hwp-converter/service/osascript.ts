import { execFile } from 'child_process';
import * as path from 'path';
import { hwpConverterConfig } from '../hwp-converter.config';
import { HwpConverterUnavailable } from '../exception/hwp-converter.exception';

export interface OsaResult {
  stdout: string;
  stderr: string;
}

const AX_DENIED = /-1728|-1719|-25211|not allowed assistive access|보조 접근|assistive/i;

/**
 * scripts/polaris/<name> AppleScript 를 인자와 함께 실행한다.
 * 보조 접근 권한이 없을 때 System Events 가 내는 오류는 HwpConverterUnavailable(503) 로 바꿔 던진다.
 */
export function runAppleScript(scriptName: string, args: string[], timeoutMs: number): Promise<OsaResult> {
  const scriptPath = path.join(hwpConverterConfig.scriptsDir, scriptName);
  return new Promise((resolve, reject) => {
    execFile(
      '/usr/bin/osascript',
      [scriptPath, ...args],
      { timeout: timeoutMs, maxBuffer: 16 * 1024 * 1024, env: { ...process.env, LANG: 'ko_KR.UTF-8' } },
      (error, stdout, stderr) => {
        const out = String(stdout ?? '');
        const err = String(stderr ?? '');
        if (error) {
          if (AX_DENIED.test(err + out)) {
            reject(
              new HwpConverterUnavailable(
                '이 프로세스에 macOS 보조 접근(Accessibility) 권한이 없어 Polaris Office 를 자동화할 수 없습니다. ' +
                  '시스템 설정 → 개인정보 보호 및 보안 → 손쉬운 사용에서 서버를 실행하는 앱(터미널 또는 node)을 허용하세요.',
                err.trim() || out.trim(),
              ),
            );
            return;
          }
          reject(new Error(`osascript ${scriptName} 실패: ${err.trim() || error.message}`));
          return;
        }
        resolve({ stdout: out.replace(/\s+$/, ''), stderr: err });
      },
    );
  });
}

/** 보조 접근 권한이 있는지 확인한다 (Finder 창 목록 접근 시도). */
export async function checkAccessibility(): Promise<{ ok: boolean; detail: string }> {
  try {
    const r = await runAppleScript('check-ax.applescript', [], 10_000);
    return { ok: r.stdout.startsWith('OK'), detail: r.stdout };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}
