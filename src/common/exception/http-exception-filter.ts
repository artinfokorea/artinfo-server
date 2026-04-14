import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { parseErrorSource } from '@/common/exception/parse-error-source';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionContents = exception.getResponse();

    let code = 'ERROR';
    let message = '';

    if (typeof exceptionContents === 'string') {
      message = exceptionContents;
    } else if (typeof exceptionContents === 'object') {
      if (exceptionContents.hasOwnProperty('message')) {
        message = exceptionContents['message'];

        if (Array.isArray(exceptionContents['message'])) {
          code = 'BAD_REQUEST';
        }
      }

      if (exceptionContents.hasOwnProperty('code')) {
        code = exceptionContents['code'];
      }
    }

    if (status >= 500) {
      const source = parseErrorSource(exception.stack);
      console.log(JSON.stringify({
        level: 'ERROR',
        type: 'HttpException',
        statusCode: status,
        code,
        message,
        class: source.className,
        function: source.methodName,
        method: request.method,
        url: request.originalUrl,
        ip: request.ip,
        stack: exception.stack,
      }));
    } else if (status >= 400) {
      const source = parseErrorSource(exception.stack);
      console.log(JSON.stringify({
        level: 'WARN',
        type: 'HttpException',
        statusCode: status,
        code,
        message,
        class: source.className,
        function: source.methodName,
        method: request.method,
        url: request.originalUrl,
      }));
    }

    response.status(status).json({
      code: code,
      message: message,
    });
  }
}
