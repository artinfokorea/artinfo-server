import { Module } from '@nestjs/common';
import { SalpyeoFacilityModule } from '@/salpyeo/facility/salpyeo-facility.module';
import { SalpyeoSchemaBootstrapService } from '@/salpyeo/common/salpyeo-schema-bootstrap.service';

/**
 * 살펴 — 법정 공개 시설(산후조리원·요양원·장례식장·어린이집·학원) 가격·평가 비교 서비스 백엔드.
 * 모든 API 는 /salpyeo/* 로 제공하며 공개(비로그인) 엔드포인트다.
 */
@Module({
  imports: [SalpyeoFacilityModule],
  providers: [SalpyeoSchemaBootstrapService],
})
export class SalpyeoModule {}
