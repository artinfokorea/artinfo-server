import { Module } from '@nestjs/common';
import { SalpyeoFacilityModule } from '@/salpyeo/facility/salpyeo-facility.module';
import { SalpyeoUserModule } from '@/salpyeo/user/salpyeo-user.module';
import { SalpyeoAuthModule } from '@/salpyeo/auth/salpyeo-auth.module';
import { SalpyeoInquiryModule } from '@/salpyeo/inquiry/salpyeo-inquiry.module';
import { SalpyeoSchemaBootstrapService } from '@/salpyeo/common/salpyeo-schema-bootstrap.service';

/**
 * 살펴 — 법정 공개 시설(산후조리원·요양원·장례식장·어린이집·학원) 가격·평가 비교 서비스 백엔드.
 * 모든 API 는 /salpyeo/* 로 제공한다. 시설 조회는 공개(비로그인)이고, /salpyeo/auths/* 는 구글 로그인, /salpyeo/users/me 는 로그인 필요.
 */
@Module({
  imports: [SalpyeoFacilityModule, SalpyeoUserModule, SalpyeoAuthModule, SalpyeoInquiryModule],
  providers: [SalpyeoSchemaBootstrapService],
})
export class SalpyeoModule {}
