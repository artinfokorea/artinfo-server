import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent');
    const start = Date.now();
    const body = req.body;

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;

      console.log(JSON.stringify({
        method,
        url: originalUrl,
        statusCode,
        ip,
        userAgent,
        body,
        duration,
      }));
    });

    next();
  }
}
