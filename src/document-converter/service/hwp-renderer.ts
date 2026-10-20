import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

/** 열린 HWP 문서 — @rhwp/core 의 HwpDocument 와 구조적으로 호환 */
export interface HwpPageRenderer {
  pageCount(): number;
  renderPageSvg(pageIndex: number): string;
  free(): void;
}

export interface HwpRendererDoctor {
  ok: boolean;
  version?: string;
  error?: string;
}

export interface HwpRendererFactory {
  open(data: Uint8Array): Promise<HwpPageRenderer>;
  doctor(): Promise<HwpRendererDoctor>;
}

interface RhwpModule {
  initSync(module: { module: BufferSource }): unknown;
  HwpDocument: new (data: Uint8Array) => HwpPageRenderer;
}

/**
 * @rhwp/core (Rust → WASM) 로더. 패키지가 ESM 전용이라 CommonJS 빌드에서는 진짜 dynamic import 로 불러온다
 * (tsc 가 import() 를 require() 로 바꾸지 않도록 Function 으로 감싼다 — Node 18 은 require(esm) 이 안 된다).
 * WASM 은 프로세스당 한 번만 초기화하고, 문서마다 HwpDocument 를 만들었다가 free 한다.
 *
 * 브라우저 전역(window·document·canvas) 없이도 SVG 렌더링은 동작함을 확인했다 (renderPageToCanvas 계열만 canvas 가 필요).
 */
export class RhwpRendererFactory implements HwpRendererFactory {
  private loading?: Promise<RhwpModule>;

  private load(): Promise<RhwpModule> {
    if (!this.loading) {
      this.loading = (async () => {
        const jsPath = require.resolve('@rhwp/core');
        const wasmPath = path.join(path.dirname(jsPath), 'rhwp_bg.wasm');
        const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<RhwpModule>;
        const mod = await dynamicImport(pathToFileURL(jsPath).href);
        mod.initSync({ module: fs.readFileSync(wasmPath) });
        return mod;
      })();
      this.loading.catch(() => {
        this.loading = undefined;
      });
    }
    return this.loading;
  }

  async open(data: Uint8Array): Promise<HwpPageRenderer> {
    const mod = await this.load();
    return new mod.HwpDocument(data);
  }

  async doctor(): Promise<HwpRendererDoctor> {
    try {
      await this.load();
      const pkgPath = path.join(path.dirname(require.resolve('@rhwp/core')), 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string };
      return { ok: true, version: pkg.version };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }
}
