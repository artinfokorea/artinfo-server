import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { IOnchurchAuthRepository } from '@/onchurch/auth/domain/repository/onchurch-auth.repository.interface';
import { OnchurchAuth, OnchurchAuthCreator } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchAuthNotFound, OnchurchFailedToRenewToken } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';

interface TokenPayload {
  token: string;
  expiresIn: Date;
}

@Injectable()
export class OnchurchAuthRepository implements IOnchurchAuthRepository {
  private ACCESS_TOKEN_EXPIRE_IN = 60 * 60; // 1 hour
  private REFRESH_TOKEN_EXPIRE_IN = 60 * 24 * 60 * 60; // 60 days

  constructor(
    @InjectRepository(OnchurchAuth)
    private readonly authRepository: Repository<OnchurchAuth>,

    private readonly jwtService: JwtService,
  ) {}

  async create(creator: OnchurchAuthCreator, user: OnchurchUser): Promise<OnchurchAuth> {
    const accessToken = this.getAccessToken(user);
    const refreshToken = this.getRefreshToken();

    return this.authRepository.save({
      userId: creator.userId,
      accessToken: accessToken.token,
      accessTokenExpiresIn: accessToken.expiresIn,
      refreshToken: refreshToken.token,
      refreshTokenExpiresIn: refreshToken.expiresIn,
    });
  }

  async renewAccessToken(user: OnchurchUser, accessToken: string, refreshToken: string): Promise<OnchurchAuth> {
    const newAccessToken = this.getAccessToken(user);
    const updateResult = await this.authRepository.update(
      { accessToken, refreshToken },
      { accessToken: newAccessToken.token, accessTokenExpiresIn: newAccessToken.expiresIn },
    );
    if (!updateResult.affected) throw new OnchurchFailedToRenewToken();

    const auth = await this.authRepository.findOneBy({ accessToken: newAccessToken.token, refreshToken });
    if (!auth) throw new OnchurchAuthNotFound();

    return auth;
  }

  async renewTokens(user: OnchurchUser, accessToken: string, refreshToken: string): Promise<OnchurchAuth> {
    const newAccessToken = this.getAccessToken(user);
    const newRefreshToken = this.getRefreshToken();

    const updateResult = await this.authRepository.update(
      { accessToken, refreshToken },
      {
        accessToken: newAccessToken.token,
        accessTokenExpiresIn: newAccessToken.expiresIn,
        refreshToken: newRefreshToken.token,
        refreshTokenExpiresIn: newRefreshToken.expiresIn,
      },
    );
    if (!updateResult.affected) throw new OnchurchFailedToRenewToken();

    const auth = await this.authRepository.findOneBy({ accessToken: newAccessToken.token, refreshToken: newRefreshToken.token });
    if (!auth) throw new OnchurchAuthNotFound();

    return auth;
  }

  private getAccessToken(user: OnchurchUser): TokenPayload {
    const token = this.jwtService.sign(
      { id: user.id, loginId: user.loginId, role: user.role },
      { privateKey: process.env['JWT_TOKEN_KEY'], expiresIn: this.ACCESS_TOKEN_EXPIRE_IN },
    );
    const expiresIn = new Date(Date.now() + this.ACCESS_TOKEN_EXPIRE_IN * 1000);

    return { token, expiresIn };
  }

  private getRefreshToken(): TokenPayload {
    const token = this.jwtService.sign({}, { privateKey: process.env['JWT_TOKEN_KEY'], expiresIn: this.REFRESH_TOKEN_EXPIRE_IN });
    const expiresIn = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRE_IN * 1000);

    return { token, expiresIn };
  }
}
