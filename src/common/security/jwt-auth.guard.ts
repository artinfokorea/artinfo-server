import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvalidAccessToken } from '@/auth/exception/auth.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      throw new InvalidAccessToken();
    }
    return user;
  }
}
