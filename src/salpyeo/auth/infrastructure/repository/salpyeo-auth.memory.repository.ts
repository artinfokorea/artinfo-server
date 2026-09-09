import { Injectable } from '@nestjs/common';
import { ISalpyeoAuthRepository } from '@/salpyeo/auth/domain/repository/salpyeo-auth.repository.interface';
import { SalpyeoAuth, SalpyeoAuthCreator } from '@/salpyeo/auth/domain/entity/salpyeo-auth.entity';
import { SalpyeoUser } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { SalpyeoFailedToRenewToken } from '@/salpyeo/auth/domain/exception/salpyeo-auth.exception';
import { SalpyeoTokenIssuer } from '@/salpyeo/auth/infrastructure/service/salpyeo-token.issuer';

/** Postgres 없이 프론트 연동을 확인할 때 쓰는 인메모리 세션 저장소 (SALPYEO_REPOSITORY=memory) */
@Injectable()
export class SalpyeoAuthMemoryRepository implements ISalpyeoAuthRepository {
  private readonly auths: SalpyeoAuth[] = [];
  private sequence = 0;

  constructor(private readonly tokenIssuer: SalpyeoTokenIssuer) {}

  async create(creator: SalpyeoAuthCreator, user: SalpyeoUser): Promise<SalpyeoAuth> {
    const accessToken = this.tokenIssuer.issueAccessToken(user);
    const refreshToken = this.tokenIssuer.issueRefreshToken();
    const now = new Date();

    const auth = {
      id: ++this.sequence,
      type: creator.type,
      userId: creator.userId,
      accessToken: accessToken.token,
      accessTokenExpiresIn: accessToken.expiresIn,
      refreshToken: refreshToken.token,
      refreshTokenExpiresIn: refreshToken.expiresIn,
      createdAt: now,
      updatedAt: now,
    } as SalpyeoAuth;
    this.auths.push(auth);

    return auth;
  }

  async renewAccessToken(user: SalpyeoUser, accessToken: string, refreshToken: string): Promise<SalpyeoAuth> {
    const auth = this.findOrThrow(accessToken, refreshToken);
    const newAccessToken = this.tokenIssuer.issueAccessToken(user);
    auth.accessToken = newAccessToken.token;
    auth.accessTokenExpiresIn = newAccessToken.expiresIn;
    auth.updatedAt = new Date();

    return auth;
  }

  async renewTokens(user: SalpyeoUser, accessToken: string, refreshToken: string): Promise<SalpyeoAuth> {
    const auth = this.findOrThrow(accessToken, refreshToken);
    const newAccessToken = this.tokenIssuer.issueAccessToken(user);
    const newRefreshToken = this.tokenIssuer.issueRefreshToken();
    auth.accessToken = newAccessToken.token;
    auth.accessTokenExpiresIn = newAccessToken.expiresIn;
    auth.refreshToken = newRefreshToken.token;
    auth.refreshTokenExpiresIn = newRefreshToken.expiresIn;
    auth.updatedAt = new Date();

    return auth;
  }

  async deleteByUserId(userId: number): Promise<void> {
    for (let i = this.auths.length - 1; i >= 0; i--) {
      if (this.auths[i].userId === userId) this.auths.splice(i, 1);
    }
  }

  private findOrThrow(accessToken: string, refreshToken: string): SalpyeoAuth {
    const auth = this.auths.find(a => a.accessToken === accessToken && a.refreshToken === refreshToken);
    if (!auth) throw new SalpyeoFailedToRenewToken();

    return auth;
  }
}
