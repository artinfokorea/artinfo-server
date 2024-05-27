import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { USER_TYPE } from '@/user/entity/user.entity';
import { Auths } from '@/common/decorator/rest-api';
import { Unauthorized } from '@/auth/exception/auth.exception';

@Injectable()
export class JwtAuth implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const auths = this.reflector.get(Auths, context.getHandler());
    if (!auths) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.type === USER_TYPE.ADMIN) return true;
    if (auths) {
      if (auths.includes(user.type)) return true;
    }

    throw new Unauthorized();
  }
}
