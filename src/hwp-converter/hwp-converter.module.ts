import { Module } from '@nestjs/common';
import { HwpConverterController } from './controller/hwp-converter.controller';
import { PolarisHwpConverterService } from './service/polaris-hwp-converter.service';

/**
 * HWP → PNG 변환 (Polaris Office GUI 자동화).
 * 스크립트는 scripts/polaris/, 마우스 클릭 도우미는 tools/axclick.swift → bin/axclick (pnpm run build:axclick).
 */
@Module({
  controllers: [HwpConverterController],
  providers: [PolarisHwpConverterService],
  exports: [PolarisHwpConverterService],
})
export class HwpConverterModule {}
