import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { OngiActivityTracker } from '@/ongi/activity/application/service/ongi-activity-tracker';

/**
 * 온기 API 에 인증된 요청이 성공하면 그날의 접속으로 기록한다 — 앱을 고치지 않아도 모든 버전의 사용자가 DAU·MAU 에 잡힌다.
 * 미들웨어는 가드보다 먼저 돌기 때문에 응답이 끝난 뒤(finish)에 가드가 채운 request.user 를 읽는다.
 * 응답을 기다리게 하지 않고, 실패해도 요청에 영향을 주지 않는다.
 */
@Injectable()
export class OngiActivityMiddleware implements NestMiddleware {
  constructor(private readonly tracker: OngiActivityTracker) {}

  use(request: Request, response: Response, next: NextFunction): void {
    response.on('finish', () => {
      if (response.statusCode >= 400) return;
      const userId = (request as Request & { user?: { id?: number } }).user?.id;
      const accessToken = String(request.headers.authorization ?? '').replace(/^Bearer\s+/i, '');

      void this.tracker.track(userId, accessToken);
    });

    next();
  }
}
