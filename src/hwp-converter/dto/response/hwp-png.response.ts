import { ApiProperty } from '@nestjs/swagger';
import { HwpConverterDoctor, HwpPngPage, HwpPngResult } from '../../service/polaris-hwp-converter.service';

export class HwpPngPageResponse {
  @ApiProperty({ type: Number, description: '페이지 번호 (1부터)' }) page: number;
  @ApiProperty({ type: String, description: 'Polaris 가 만든 파일명' }) fileName: string;
  @ApiProperty({ type: Number, description: '가로 픽셀' }) width: number;
  @ApiProperty({ type: Number, description: '세로 픽셀' }) height: number;
  @ApiProperty({ type: Number, description: '바이트 크기' }) bytes: number;
  @ApiProperty({ type: String, description: 'MIME 타입', example: 'image/png' }) mimeType: string;
  @ApiProperty({ type: String, description: 'PNG 바이너리 (base64)' }) data: string;

  constructor(p: HwpPngPage) {
    this.page = p.page;
    this.fileName = p.fileName;
    this.width = p.width;
    this.height = p.height;
    this.bytes = p.bytes;
    this.mimeType = 'image/png';
    this.data = p.data.toString('base64');
  }
}

export class HwpPngResponse {
  @ApiProperty({ type: String, description: '작업 아이디' }) jobId: string;
  @ApiProperty({ type: String, description: '원본 파일명' }) originalName: string;
  @ApiProperty({ type: Number, description: '페이지 수' }) pageCount: number;
  @ApiProperty({ type: Number, description: '소요 시간(ms)' }) elapsedMs: number;
  @ApiProperty({ type: [String], description: '자동화 진행 단계' }) steps: string[];
  @ApiProperty({ type: [HwpPngPageResponse], description: '페이지별 PNG' }) pages: HwpPngPageResponse[];

  constructor(r: HwpPngResult) {
    this.jobId = r.jobId;
    this.originalName = r.originalName;
    this.pageCount = r.pageCount;
    this.elapsedMs = r.elapsedMs;
    this.steps = r.steps;
    this.pages = r.pages.map(p => new HwpPngPageResponse(p));
  }
}

export class HwpConverterDoctorResponse {
  @ApiProperty({ type: Boolean, description: '변환 가능 여부' }) ok: boolean;
  @ApiProperty({ type: String }) platform: string;
  @ApiProperty({ type: Boolean }) polarisInstalled: boolean;
  @ApiProperty({ type: Boolean, description: 'bin/axclick 빌드 여부' }) axclickBuilt: boolean;
  @ApiProperty({ type: Boolean, description: '보조 접근 권한' }) accessibilityOk: boolean;
  @ApiProperty({ type: String }) accessibilityDetail: string;
  @ApiProperty({ type: String }) workDir: string;
  @ApiProperty({ type: Number, description: '대기 중 요청 수' }) queued: number;

  constructor(d: HwpConverterDoctor) {
    this.ok = d.ok;
    this.platform = d.platform;
    this.polarisInstalled = d.polarisInstalled;
    this.axclickBuilt = d.axclickBuilt;
    this.accessibilityOk = d.accessibility.ok;
    this.accessibilityDetail = d.accessibility.detail;
    this.workDir = d.workDir;
    this.queued = d.queued;
  }
}
