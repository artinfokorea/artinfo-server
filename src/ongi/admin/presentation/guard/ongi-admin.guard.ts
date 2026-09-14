import { CanActivate, createParamDecorator, ExecutionContext, Inject, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { InvalidAccessToken } from '@/auth/exception/auth.exception';
import { adminTypeOfSession, hasAdminPermission, OngiAdminPermission, OngiAdminType } from '@/ongi/admin/domain/service/ongi-admin-policy';
import { IOngiAdminRepository, ONGI_ADMIN_REPOSITORY } from '@/ongi/admin/domain/repository/ongi-admin.repository.interface';
import { OngiAdminForbidden, OngiAdminPermissionDenied } from '@/ongi/admin/domain/exception/ongi-admin.exception';

const PERMISSION_KEY = 'ongiAdminPermission';

/** 핸들러에 필요한 관리자 권한 — 없으면 ADMIN 이상이면 통과 */
export const RequireOngiAdminPermission = (permission: OngiAdminPermission) => SetMetadata(PERMISSION_KEY, permission);

export interface OngiAdminActor {
  userId: number;
  type: OngiAdminType;
}

export const AdminActor = createParamDecorator((_: unknown, ctx: ExecutionContext): OngiAdminActor => ctx.switchToHttp().getRequest().ongiAdmin);

/**
 * 온기 관리자 가드 — JWT 검증 후 ongi_auths 세션 · ongi_users.type 을 매 요청 DB 에서 다시 읽는다.
 * 토큰에 등급을 담지 않는 이유: DB 에서 등급을 내렸을 때 이미 발급된 토큰이 살아남으면 안 된다.
 */
@Injectable()
export class OngiAdminGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    @Inject(ONGI_ADMIN_REPOSITORY)
    private readonly adminRepository: IOngiAdminRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const tokenUserId = request.user?.id;
    const accessToken = String(request.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    if (!tokenUserId || !accessToken) throw new InvalidAccessToken();

    const [session, user] = await Promise.all([this.adminRepository.findSessionByAccessToken(accessToken), this.adminRepository.findUserTypeById(tokenUserId)]);
    const type = adminTypeOfSession({ tokenUserId, session, user });
    if (!type) throw new OngiAdminForbidden();

    const permission = this.reflector.get<OngiAdminPermission | undefined>(PERMISSION_KEY, context.getHandler());
    if (permission && !hasAdminPermission(type, permission)) throw new OngiAdminPermissionDenied();

    request.ongiAdmin = { userId: tokenUserId, type } satisfies OngiAdminActor;

    return true;
  }

  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) throw new InvalidAccessToken();

    return user;
  }
}
