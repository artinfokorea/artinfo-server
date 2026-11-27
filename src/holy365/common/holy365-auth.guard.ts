import { applyDecorators, CanActivate, createParamDecorator, ExecutionContext, Injectable, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

/** access token payload 의 서비스 구분값 — 같은 JWT 키를 쓰는 다른 서비스(온기·온교회 등) 토큰을 막는다 */
export const HOLY365_TOKEN_SERVICE = 'holy365';

export interface Holy365Signature {
  id: number;
  name: string;
}

@Injectable()
export class Holy365AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers['authorization'];
    if (!header?.startsWith('Bearer ')) throw Holy365Errors.unauthorized();

    try {
      const payload = jwt.verify(header.slice(7), process.env['JWT_TOKEN_KEY']!) as jwt.JwtPayload;
      if (payload['svc'] !== HOLY365_TOKEN_SERVICE || typeof payload['id'] !== 'number') throw Holy365Errors.unauthorized();
      request.holy365User = { id: payload['id'], name: payload['name'] } satisfies Holy365Signature;

      return true;
    } catch {
      throw Holy365Errors.unauthorized();
    }
  }
}

/** 홀리365 로그인 필요 — RestApiGet/Post 등과 함께 쓴다 (그쪽의 auth 옵션은 쓰지 않는다) */
export function Holy365Auth(): MethodDecorator {
  return applyDecorators(UseGuards(Holy365AuthGuard), ApiBearerAuth());
}

export const Holy365User = createParamDecorator((_: unknown, ctx: ExecutionContext): Holy365Signature => ctx.switchToHttp().getRequest().holy365User);
