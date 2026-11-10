import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 토큰이 있으면 검증해 request.user 를 채우고, 없거나 유효하지 않으면 비회원(user 없음)으로 통과시킨다.
 * 공개 엔드포인트에서 "본인이면 더 보여주는" 경우에 쓴다 (예: 검토 중인 콩쿠르 공고).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(_err: unknown, user: TUser | false): TUser | null {
    return user || null;
  }
}
