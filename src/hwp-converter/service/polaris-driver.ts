import { execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { hwpConverterConfig } from '../hwp-converter.config';
import { HwpConversionFailed, HwpConversionTimeout, HwpConverterUnavailable } from '../exception/hwp-converter.exception';
import { naturalCompare } from '../util/natural-compare';
import { runAppleScript } from './osascript';

/** 서비스가 의존하는 드라이버 인터페이스 (테스트에서 가짜로 대체) */
export interface HwpConverterDriver {
  /** 문서를 열고 창이 뜰 때까지 기다린다. 닫은 안내 대화상자 제목 목록을 돌려준다. */
  openDocument(filePath: string, titlePart: string): Promise<string[]>;
  /** Backstage 내보내기 → PNG. 결과는 문서 폴더 아래 <outName>.png/ 폴더에 쓰인다. */
  exportPng(outName: string): Promise<{ steps: string[] }>;
  /** searchDir 아래의 PNG 들이 모두 생길 때까지 기다린 뒤 경로 목록을 돌려준다. */
  waitForPngs(searchDir: string, timeoutMs: number): Promise<string[]>;
  closeDocument(): Promise<string>;
  dumpUi(maxDepth?: number): Promise<string>;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  /** 요소를 가진 프로세스의 pid (find-text 가 돌려줌) */
  pid?: number;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function exists(p: string): boolean {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function exec(cmd: string, args: string[], timeoutMs = 15_000): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error) reject(new Error(`${path.basename(cmd)} 실패: ${String(stderr).trim() || error.message}`));
      else resolve(String(stdout).trim());
    });
  });
}

function parseRect(s: string): Rect | null {
  const m = s.trim().match(/^(-?\d+) (-?\d+) (\d+) (\d+)(?: (\d+))?$/);
  if (!m) return null;
  const r: Rect = { x: Number(m[1]), y: Number(m[2]), w: Number(m[3]), h: Number(m[4]) };
  if (m[5]) r.pid = Number(m[5]);
  return r;
}

/** dir 아래 depth 단계까지의 .png 파일을 자연 정렬해 돌려준다 */
function collectPngs(dir: string, depth: number): string[] {
  if (!exists(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (depth > 0) out.push(...collectPngs(full, depth - 1));
    } else if (entry.name.toLowerCase().endsWith('.png')) {
      out.push(full);
    }
  }
  return out.sort((a, b) => naturalCompare(path.basename(a), path.basename(b)));
}

/**
 * Polaris Office(Mac App Store 샌드박스 앱)를 GUI 자동화로 구동한다.
 *
 * 실측으로 확인한 흐름 (Polaris Office 9.0.70, HWP 보기 모드):
 *  1. `open -a "Polaris Office" <file>` → 런처가 내부 "Polaris Office Editor" 를 띄워 문서를 연다.
 *     창 제목은 비어 있고, 툴바의 AXStaticText 에 "<파일명> - 내 컴퓨터에 저장됨" 이 들어간다.
 *     모달에 막힌 인스턴스가 남으면 Editor 가 여럿 뜰 수 있어, 문서를 가진 프로세스 pid 를 기억해 그 pid 에만 조작한다.
 *  2. 리본 "파일" · Backstage 항목들은 액션 없는 커스텀 뷰라 AXPress 가 통하지 않는다 →
 *     접근성 트리에서 위치만 읽고 bin/axclick(CGEvent) 으로 실제 마우스 클릭을 보낸다.
 *  3. "파일" → 왼쪽 메뉴 "내보내기" → "PNG 이미지(.png)" → "페이지 범위" 패널(기본 모두)의 제목 없는 내보내기 버튼 → 제목 "내보내기" 인 저장 패널.
 *  4. 패널의 이름 필드는 경로를 받지 않는다(슬래시 → 콜론). 저장 위치는 문서가 있는 폴더.
 *     결과는 `<문서 폴더>/<입력한 이름>.png/<문서명>_0001.png …` 로 페이지마다 한 파일.
 *  5. 키 입력(keystroke) 은 쓰지 않는다 — Editor 가 마지막 창을 닫으며 종료되면 키 입력이 다른 앱(터미널 등)으로 간다.
 *     문서 닫기도 창의 닫기 버튼 클릭으로 한다.
 */
export class PolarisDriver implements HwpConverterDriver {
  private readonly proc = hwpConverterConfig.editorProcessName;
  private pid = 0;

  ensureReady(): void {
    if (!exists(hwpConverterConfig.polarisAppPath)) {
      throw new HwpConverterUnavailable(`Polaris Office 가 설치되어 있지 않습니다: ${hwpConverterConfig.polarisAppPath}`);
    }
    if (!exists(hwpConverterConfig.axclickPath)) {
      throw new HwpConverterUnavailable(`${hwpConverterConfig.axclickPath} 가 없습니다. "pnpm run build:axclick" (swiftc 필요) 를 실행하세요.`);
    }
  }

  async dismissDialogs(): Promise<string[]> {
    try {
      const r = await runAppleScript('dismiss-dialogs.applescript', [this.proc], 15_000);
      if (r.stdout === 'NONE' || r.stdout === 'NO_PROCESS') return [];
      return r.stdout.split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  async openDocument(filePath: string, titlePart: string): Promise<string[]> {
    this.ensureReady();
    await exec('/usr/bin/open', ['-a', hwpConverterConfig.polarisAppPath, filePath]);
    const deadline = Date.now() + hwpConverterConfig.openTimeoutMs;
    const dismissed: string[] = [];
    while (Date.now() < deadline) {
      dismissed.push(...(await this.dismissDialogs()));
      const r = await this.findText('contains', titlePart);
      if (r) {
        this.pid = r.pid ?? 0;
        await sleep(1500); // 문서 렌더링 여유
        dismissed.push(...(await this.dismissDialogs()));
        return dismissed;
      }
      await sleep(500);
    }
    throw new HwpConversionTimeout('open_document', hwpConverterConfig.openTimeoutMs);
  }

  async exportPng(outName: string): Promise<{ steps: string[] }> {
    const steps: string[] = [];
    await runAppleScript('frontmost.applescript', [this.proc, String(this.pid)], 10_000);

    const fileTab = await this.waitText('equals', '파일', 8_000, -9999, 100);
    await this.clickRect(fileTab);
    steps.push('ribbon_file_clicked');

    const exportMenu = await this.waitText('equals', '내보내기', 8_000, -9999, 200);
    await this.clickRect(exportMenu);
    steps.push('backstage_export_clicked');

    const pngItem = await this.waitText('equals', 'PNG 이미지(.png)', 8_000);
    await this.clickRect(pngItem);
    steps.push('png_item_clicked');

    const pageRange = await this.waitText('equals', '페이지 범위', 8_000);
    const btn = await this.waitButton(pageRange.x, pageRange.y + 60, pageRange.y + 220, 50, 6_000);
    await this.clickRect(btn);
    steps.push('export_button_clicked');

    await this.waitWindowTitle('내보내기', 15_000);
    const saved = await runAppleScript('panel-save.applescript', [this.proc, String(this.pid), '내보내기', outName], 20_000);
    if (!saved.stdout.startsWith('SAVED')) {
      throw new HwpConversionFailed(`내보내기 패널 처리 실패: ${saved.stdout}`, { steps });
    }
    steps.push(`panel_saved(${saved.stdout.replace(/^SAVED /, '')})`);
    await this.waitWindowGone('내보내기', 15_000);
    steps.push('panel_closed');
    return { steps };
  }

  async waitForPngs(searchDir: string, timeoutMs: number): Promise<string[]> {
    const deadline = Date.now() + timeoutMs;
    let last = '';
    let stable = 0;
    while (Date.now() < deadline) {
      const files = collectPngs(searchDir, 1);
      if (files.length > 0) {
        const sig = files.map(f => `${f}:${fs.statSync(f).size}`).join('|');
        if (sig === last) {
          stable += 1;
          if (stable >= 2) return files;
        } else {
          stable = 0;
          last = sig;
        }
      }
      await sleep(600);
    }
    throw new HwpConversionTimeout('wait_png_output', timeoutMs);
  }

  async closeDocument(): Promise<string> {
    try {
      const r = await runAppleScript('close-document.applescript', [this.proc, String(this.pid)], 30_000);
      return r.stdout.trim();
    } catch (e) {
      return `CLOSE_ERROR ${(e as Error).message}`;
    }
  }

  async dumpUi(maxDepth = 10): Promise<string> {
    const r = await runAppleScript('dump-ui.applescript', [this.proc, String(maxDepth)], 60_000);
    return r.stdout;
  }

  private async findText(mode: 'equals' | 'contains', text: string, minX?: number, maxX?: number): Promise<Rect | null> {
    const args = [this.proc, mode, text];
    if (minX !== undefined) args.push(String(minX));
    if (maxX !== undefined) args.push(String(maxX));
    const r = await runAppleScript('find-text.applescript', args, 20_000);
    return parseRect(r.stdout);
  }

  private async waitText(mode: 'equals' | 'contains', text: string, timeoutMs: number, minX?: number, maxX?: number): Promise<Rect> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const r = await this.findText(mode, text, minX, maxX);
      if (r && (!this.pid || !r.pid || r.pid === this.pid)) return r;
      await sleep(300);
    }
    throw new HwpConversionFailed(`UI 요소를 찾지 못했습니다: "${text}"`, { text, uiDump: await this.safeDump() });
  }

  private async waitButton(minX: number, minY: number, maxY: number, minW: number, timeoutMs: number): Promise<Rect> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const args = [this.proc, String(this.pid), String(minX), String(minY), String(maxY), String(minW)];
      const r = await runAppleScript('find-button.applescript', args, 20_000);
      const rect = parseRect(r.stdout);
      if (rect) return rect;
      await sleep(300);
    }
    throw new HwpConversionFailed('내보내기 버튼을 찾지 못했습니다.', { uiDump: await this.safeDump() });
  }

  private async windowTitles(): Promise<string[]> {
    const r = await runAppleScript('window-titles.applescript', [this.proc, String(this.pid)], 10_000);
    if (r.stdout === 'NO_PROCESS') return [];
    // 각 줄: pid<TAB>subrole<TAB>title
    return r.stdout.split('\n').map(l => l.split('\t')[2] ?? '');
  }

  private async waitWindowTitle(title: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if ((await this.windowTitles()).includes(title)) return;
      await sleep(300);
    }
    throw new HwpConversionTimeout(`wait_window:${title}`, timeoutMs);
  }

  private async waitWindowGone(title: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (!(await this.windowTitles()).includes(title)) return;
      await sleep(300);
    }
    throw new HwpConversionTimeout(`wait_window_gone:${title}`, timeoutMs);
  }

  private async clickRect(r: Rect): Promise<void> {
    const cx = Math.round(r.x + r.w / 2);
    const cy = Math.round(r.y + r.h / 2);
    await exec(hwpConverterConfig.axclickPath, ['move', String(cx), String(cy)]);
    await sleep(250);
    await exec(hwpConverterConfig.axclickPath, ['click', String(cx), String(cy)]);
    await sleep(900);
  }

  private async safeDump(): Promise<string | undefined> {
    try {
      return await this.dumpUi(8);
    } catch {
      return undefined;
    }
  }
}
