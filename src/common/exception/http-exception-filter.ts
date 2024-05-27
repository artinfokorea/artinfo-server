import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
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

    response.status(status).json({
      code: code,
      message: message,
    });
  }
}
