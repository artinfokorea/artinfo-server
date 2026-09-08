import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptor/interceptor';
import { setSwagger } from '@/common/swagger/swagger';
import { HttpExceptionFilter } from '@/common/exception/http-exception-filter';
import { AllExceptionFilter } from '@/common/exception/all-exception-filter';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.useGlobalFilters(new AllExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  setSwagger(app);

  // 로컬에서 프론트(3000)와 함께 띄울 때 PORT 로 바꿀 수 있다. 기본값·Dockerfile 은 3000 그대로.
  await app.listen(Number(process.env['PORT'] ?? 3000));
}
bootstrap();
