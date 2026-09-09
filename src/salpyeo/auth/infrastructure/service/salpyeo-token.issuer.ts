import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SalpyeoUser } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';

export interface SalpyeoTokenPayload {
  token: string;
  expiresIn: Date;
}

export const SALPYEO_ACCESS_TOKEN_EXPIRE_IN = 60 * 60; // 1 hour
export const SALPYEO_REFRESH_TOKEN_EXPIRE_IN = 60 * 24 * 60 * 60; // 60 days

/**
 * 살펴 로그인 토큰 발급. access token 의 payload 는 공용 JwtStrategy 가 그대로 UserSignature 로 넘기므로
 * id·name·email 세 개를 반드시 담는다.
 */
@Injectable()
export class SalpyeoTokenIssuer {
  constructor(private readonly jwtService: JwtService) {}

  issueAccessToken(user: SalpyeoUser): SalpyeoTokenPayload {
    const token = this.jwtService.sign(
      { id: user.id, name: user.name, email: user.email },
      { secret: this.secret(), expiresIn: SALPYEO_ACCESS_TOKEN_EXPIRE_IN },
    );

    return { token, expiresIn: new Date(Date.now() + SALPYEO_ACCESS_TOKEN_EXPIRE_IN * 1000) };
  }

  issueRefreshToken(): SalpyeoTokenPayload {
    const token = this.jwtService.sign({}, { secret: this.secret(), expiresIn: SALPYEO_REFRESH_TOKEN_EXPIRE_IN });

    return { token, expiresIn: new Date(Date.now() + SALPYEO_REFRESH_TOKEN_EXPIRE_IN * 1000) };
  }

  verifyRefreshToken(refreshToken: string): { exp: number } {
    return this.jwtService.verify(refreshToken, { secret: this.secret() });
  }

  decodeAccessToken(accessToken: string): { id: number } | null {
    return this.jwtService.decode(accessToken) as { id: number } | null;
  }

  private secret(): string {
    const key = process.env['JWT_TOKEN_KEY'];
    if (!key) throw new Error('JWT_TOKEN_KEY 가 설정되지 않았습니다.');

    return key;
  }
}
