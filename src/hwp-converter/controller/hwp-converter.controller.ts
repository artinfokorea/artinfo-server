import { Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiProduces, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { UploadFile } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { PolarisHwpConverterService } from '../service/polaris-hwp-converter.service';
import { HwpFileRequired, HwpPageNotFound } from '../exception/hwp-converter.exception';
import { ConvertHwpPngBody, ConvertHwpPngQuery } from '../dto/request/convert-hwp-png.request';
import { HwpConverterDoctorResponse, HwpPngResponse } from '../dto/response/hwp-png.response';

const MAX_HWP_BYTES = 50 * 1024 * 1024;

/**
 * HWP → PNG 변환 API. Polaris Office 가 설치된 macOS 에서 서버를 띄웠을 때만 동작한다 (그 외 503).
 * 변환은 GUI 자동화라 한 번에 하나씩, 문서당 수십 초가 걸린다. 관리자 전용.
 */
@RestApiController('/hwp-converter', 'HwpConverter')
export class HwpConverterController {
  constructor(private readonly hwpConverterService: PolarisHwpConverterService) {}

  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json', 'image/png')
  @ApiBody({ type: ConvertHwpPngBody })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'png'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @UseInterceptors(FilesInterceptor('file', 1, { limits: { fileSize: MAX_HWP_BYTES, files: 1 } }))
  @RestApiPost(HwpPngResponse, {
    path: '/png',
    description: 'HWP/HWPX 를 페이지별 PNG 로 변환 (Polaris Office GUI 자동화, 관리자 전용)',
    auth: [USER_TYPE.ADMIN],
  })
  async convertToPng(@UploadedFiles() files: UploadFile[], @Query() query: ConvertHwpPngQuery, @Res() res: Response): Promise<HwpPngResponse | undefined> {
    if (!files || files.length === 0) {
      throw new HwpFileRequired();
    }
    const file = files[0];
    const result = await this.hwpConverterService.convertToPng(file.buffer, file.originalname);

    if (query.format === 'png') {
      const pageNo = Number(query.page ?? 1);
      const page = result.pages.find(p => p.page === pageNo);
      if (!page) {
        throw new HwpPageNotFound(pageNo, result.pageCount);
      }
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('X-Page-Count', String(result.pageCount));
      res.setHeader('X-Job-Id', result.jobId);
      res.status(200).send(page.data);
      return undefined;
    }

    // @Res() 를 직접 쓰므로 공통 응답 봉투({ code, message, item }) 를 여기서 맞춘다
    const body = new HwpPngResponse(result);
    res.status(200).json({ code: 'OK', message: null, item: body });
    return body;
  }

  @RestApiGet(HwpConverterDoctorResponse, {
    path: '/doctor',
    description: 'HWP 변환 환경 점검 — macOS · Polaris 설치 · axclick 빌드 · 보조 접근 권한 (관리자 전용)',
    auth: [USER_TYPE.ADMIN],
  })
  async doctor(): Promise<HwpConverterDoctorResponse> {
    return new HwpConverterDoctorResponse(await this.hwpConverterService.doctor());
  }
}
