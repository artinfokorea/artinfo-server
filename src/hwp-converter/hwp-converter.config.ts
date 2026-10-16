import * as os from 'os';
import * as path from 'path';

const env = (key: string, fallback: string): string => process.env[key] ?? fallback;

/**
 * Polaris Office GUI 자동화 설정. 모두 환경 변수로 바꿀 수 있다.
 * 스크립트·axclick 경로는 Docker(/server) 와 로컬 모두에서 cwd 기준으로 잡는다.
 */
export const hwpConverterConfig = {
  /** 업로드·출력 작업 디렉터리. Polaris(샌드박스)는 LaunchServices 로 연 문서의 폴더에 쓸 수 있다. */
  workDir: env('HWP_CONVERTER_WORK_DIR', path.join(os.tmpdir(), 'artinfo-hwp-converter')),
  polarisAppPath: env('POLARIS_APP', '/Applications/Polaris Office.app'),
  editorProcessName: env('POLARIS_EDITOR_PROCESS', 'Polaris Office Editor'),
  scriptsDir: env('HWP_CONVERTER_SCRIPTS_DIR', path.resolve(process.cwd(), 'scripts', 'polaris')),
  axclickPath: env('HWP_CONVERTER_AXCLICK', path.resolve(process.cwd(), 'bin', 'axclick')),
  /** 문서 창이 뜨길 기다리는 최대 시간 (Editor 기동 포함) */
  openTimeoutMs: Number(env('HWP_CONVERTER_OPEN_TIMEOUT_MS', '45000')),
  /** PNG 파일 생성 완료까지 기다리는 최대 시간 */
  exportTimeoutMs: Number(env('HWP_CONVERTER_EXPORT_TIMEOUT_MS', '120000')),
  /** 변환 후 작업 폴더 정리 (디버깅 시 false) */
  cleanup: env('HWP_CONVERTER_CLEANUP', 'true') !== 'false',
};

export const HWP_EXTENSIONS = new Set(['.hwp', '.hwpx', '.hwt', '.hwtx']);

/** 테스트에서 가짜 드라이버·환경을 주입할 때 쓰는 DI 토큰 */
export const HWP_CONVERTER_DRIVER = 'HWP_CONVERTER_DRIVER';
export const HWP_CONVERTER_ENV = 'HWP_CONVERTER_ENV';
