import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISalpyeoAuthRepository } from '@/salpyeo/auth/domain/repository/salpyeo-auth.repository.interface';
import { SalpyeoAuth, SalpyeoAuthCreator } from '@/salpyeo/auth/domain/entity/salpyeo-auth.entity';
import { SalpyeoUser } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { SalpyeoAuthNotFound, SalpyeoFailedToRenewToken } from '@/salpyeo/auth/domain/exception/salpyeo-auth.exception';
import { SalpyeoTokenIssuer } from '@/salpyeo/auth/infrastructure/service/salpyeo-token.issuer';

@Injectable()
export class SalpyeoAuthRepository implements ISalpyeoAuthRepository {
  constructor(
    @InjectRepository(SalpyeoAuth)
    private readonly authRepository: Repository<SalpyeoAuth>,

    private readonly tokenIssuer: SalpyeoTokenIssuer,
  ) {}

  async create(creator: SalpyeoAuthCreator, user: SalpyeoUser): Promise<SalpyeoAuth> {
    const accessToken = this.tokenIssuer.issueAccessToken(user);
    const refreshToken = this.tokenIssuer.issueRefreshToken();

    return this.authRepository.save({
      type: creator.type,
      userId: creator.userId,
      accessToken: accessToken.token,
      accessTokenExpiresIn: accessToken.expiresIn,
      refreshToken: refreshToken.token,
      refreshTokenExpiresIn: refreshToken.expiresIn,
    });
  }

  async renewAccessToken(user: SalpyeoUser, accessToken: string, refreshToken: string): Promise<SalpyeoAuth> {
    const newAccessToken = this.tokenIssuer.issueAccessToken(user);

    const updateResult = await this.authRepository.update(
      { accessToken, refreshToken },
      { accessToken: newAccessToken.token, accessTokenExpiresIn: newAccessToken.expiresIn },
    );
    if (!updateResult.affected) throw new SalpyeoFailedToRenewToken();

    const auth = await this.authRepository.findOneBy({ accessToken: newAccessToken.token, refreshToken });
    if (!auth) throw new SalpyeoAuthNotFound();

    return auth;
  }

  async renewTokens(user: SalpyeoUser, accessToken: string, refreshToken: string): Promise<SalpyeoAuth> {
    const newAccessToken = this.tokenIssuer.issueAccessToken(user);
    const newRefreshToken = this.tokenIssuer.issueRefreshToken();

    const updateResult = await this.authRepository.update(
      { accessToken, refreshToken },
      {
        accessToken: newAccessToken.token,
        accessTokenExpiresIn: newAccessToken.expiresIn,
        refreshToken: newRefreshToken.token,
        refreshTokenExpiresIn: newRefreshToken.expiresIn,
      },
    );
    if (!updateResult.affected) throw new SalpyeoFailedToRenewToken();

    const auth = await this.authRepository.findOneBy({ accessToken: newAccessToken.token, refreshToken: newRefreshToken.token });
    if (!auth) throw new SalpyeoAuthNotFound();

    return auth;
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.authRepository.delete({ userId });
  }
}
