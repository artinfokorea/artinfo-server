import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvalidAccessToken } from '@/auth/exception/auth.exception';
import { SALPYEO_USER_ROLE } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { ISalpyeoUserRepository, SALPYEO_USER_REPOSITORY } from '@/salpyeo/user/domain/repository/salpyeo-user.repository.interface';

export class SalpyeoForbidden extends HttpException {
  constructor() {
    super(
      {
        code: 'SALPYEO-ADMIN-001',
        message: '관리자만 사용할 수 있습니다.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * 관리자 전용 가드 — 토큰을 검증한 뒤 DB 의 role 을 다시 읽는다.
 * 토큰에 role 을 담지 않는 이유: DB 에서 권한을 내렸을 때 이미 발급된 토큰(최대 1시간)이 살아남으면 안 된다.
 */
@Injectable()
export class SalpyeoAdminGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    @Inject(SALPYEO_USER_REPOSITORY)
    private readonly userRepository: ISalpyeoUserRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    if (!userId) throw new InvalidAccessToken();

    const user = await this.userRepository.findById(userId);
    if (!user || user.role !== SALPYEO_USER_ROLE.ADMIN) throw new SalpyeoForbidden();

    return true;
  }

  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) throw new InvalidAccessToken();

    return user;
  }
}
