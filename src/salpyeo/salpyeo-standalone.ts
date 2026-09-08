import { NestFactory } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@/common/interceptor/interceptor';
import { HttpExceptionFilter } from '@/common/exception/http-exception-filter';
import { AllExceptionFilter } from '@/common/exception/all-exception-filter';
import { setSwagger } from '@/common/swagger/swagger';
import { SalpyeoFacilityModule } from '@/salpyeo/facility/salpyeo-facility.module';

/**
 * 살펴 API 단독 기동 (Postgres·Redis 없이, 시드 메모리 리포지토리).
 * 프론트(salpyeo-client) 로컬 연동 확인용 — 운영 진입점은 src/main.ts 다.
 *
 *   SALPYEO_REPOSITORY=memory PORT=4000 npx ts-node -r tsconfig-paths/register src/salpyeo/salpyeo-standalone.ts
 */
@Module({ imports: [SalpyeoFacilityModule] })
class SalpyeoStandaloneModule {}

async function bootstrap() {
  if (process.env['SALPYEO_REPOSITORY'] !== 'memory') {
    throw new Error('salpyeo-standalone 은 SALPYEO_REPOSITORY=memory 로만 기동합니다. DB 연동은 src/main.ts 를 사용하세요.');
  }
  const app = await NestFactory.create(SalpyeoStandaloneModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableCors({ origin: '*', methods: 'GET,HEAD,OPTIONS' });
  setSwagger(app);

  const port = Number(process.env['PORT'] ?? 4000);
  await app.listen(port);
  console.log(`[salpyeo-standalone] http://localhost:${port}/salpyeo/verticals · docs http://localhost:${port}/api-docs`);
}
bootstrap();
