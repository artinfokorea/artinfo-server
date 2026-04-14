import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // HttpException은 HttpExceptionFilter에서 처리
    if (exception instanceof HttpException) throw exception;

    const error = exception instanceof Error ? exception : new Error(String(exception));

    console.log(JSON.stringify({
      level: 'ERROR',
      type: 'UnhandledException',
      statusCode: 500,
      class: error.constructor?.name ?? 'Unknown',
      message: error.message,
      method: request?.method,
      url: request?.originalUrl,
      ip: request?.ip,
      stack: error.stack,
    }));

    response.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.',
    });
  }
}
