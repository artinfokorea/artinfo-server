import { NestFactory } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ResponseInterceptor } from '@/common/interceptor/interceptor';
import { HttpExceptionFilter } from '@/common/exception/http-exception-filter';
import { AllExceptionFilter } from '@/common/exception/all-exception-filter';
import { JwtStrategy } from '@/common/security/jwt.strategy';
import { setSwagger } from '@/common/swagger/swagger';
import { SalpyeoFacilityModule } from '@/salpyeo/facility/salpyeo-facility.module';
import { SalpyeoUserModule } from '@/salpyeo/user/salpyeo-user.module';
import { SalpyeoAuthModule } from '@/salpyeo/auth/salpyeo-auth.module';

/**
 * 살펴 API 단독 기동 (Postgres·Redis 없이, 시드 메모리 리포지토리).
 * 프론트(salpyeo-client) 로컬 연동 확인용 — 운영 진입점은 src/main.ts 다.
 * 로그인도 인메모리라 프로세스를 내리면 가입 기록이 사라진다.
 *
 *   SALPYEO_REPOSITORY=memory PORT=4000 npx ts-node -r tsconfig-paths/register src/salpyeo/salpyeo-standalone.ts
 */
@Module({
  // /salpyeo/users/me 의 JwtAuthGuard 가 쓰는 passport 전략은 전체 앱에서 AuthModule 이 등록한다 — 단독 기동에서는 여기서 등록
  imports: [PassportModule, SalpyeoFacilityModule, SalpyeoUserModule, SalpyeoAuthModule],
  providers: [JwtStrategy],
})
class SalpyeoStandaloneModule {}

/** 로컬 단독 기동 전용 서명 키 — 운영(src/main.ts)에는 JWT_TOKEN_KEY 가 반드시 주입된다 */
const LOCAL_JWT_TOKEN_KEY = 'salpyeo-local-dev-key';

async function bootstrap() {
  if (process.env['SALPYEO_REPOSITORY'] !== 'memory') {
    throw new Error('salpyeo-standalone 은 SALPYEO_REPOSITORY=memory 로만 기동합니다. DB 연동은 src/main.ts 를 사용하세요.');
  }
  // 공용 JwtStrategy 와 토큰 발급기가 기동 시점에 읽는다 — 로컬 확인용이라 키를 요구하지 않는다
  if (!process.env['JWT_TOKEN_KEY']) {
    process.env['JWT_TOKEN_KEY'] = LOCAL_JWT_TOKEN_KEY;
    console.warn(`[salpyeo-standalone] JWT_TOKEN_KEY 가 없어 로컬 전용 키로 기동합니다 (발급된 토큰은 이 프로세스에서만 유효).`);
  }
  const app = await NestFactory.create(SalpyeoStandaloneModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableCors({ origin: '*', methods: 'GET,HEAD,POST,OPTIONS' });
  setSwagger(app);

  const port = Number(process.env['PORT'] ?? 4000);
  await app.listen(port);
  console.log(`[salpyeo-standalone] http://localhost:${port}/salpyeo/verticals · docs http://localhost:${port}/api-docs`);
}
bootstrap();
