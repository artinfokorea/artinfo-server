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
      const user = req.user;

      const logMessage = {
        method,
        url: originalUrl,
        statusCode,
        ip,
        user: user,
        userAgent,
        body: body,
        duration,
      };

      const logString = JSON.stringify(logMessage);

      if (statusCode >= 500) {
        console.log(chalk.red(logString));
      } else if (statusCode >= 400) {
        console.log(chalk.yellow(logString));
      } else {
        console.log(chalk.white(logString));
      }
    });

    next();
  }
}
