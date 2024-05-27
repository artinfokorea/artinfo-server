import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as chalk from 'chalk';

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

      if (statusCode >= 500) {
        console.log(chalk.red(`[ ${method} ][ ${originalUrl} ][ ${statusCode} ] ${ip} ${userAgent} ${JSON.stringify(body)} ${duration}ms`));
      } else if (statusCode >= 400) {
        console.log(chalk.yellow(`[ ${method} ][ ${originalUrl} ][ ${statusCode} ] ${ip} ${userAgent} ${JSON.stringify(body)} ${duration}ms`));
      } else {
        console.log(chalk.white(`[ ${method} ][ ${originalUrl} ][ ${statusCode} ] ${ip} ${userAgent} ${duration}ms`));
      }
    });

    next();
  }
}
