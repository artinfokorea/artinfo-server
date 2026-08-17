import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { IOngiAuthRepository } from '@/ongi/auth/domain/repository/ongi-auth.repository.interface';
import { OngiAuth, OngiAuthCreator } from '@/ongi/auth/domain/entity/ongi-auth.entity';
import { OngiUser } from '@/ongi/user/domain/entity/ongi-user.entity';
import { OngiAuthNotFound, OngiFailedToRenewToken } from '@/ongi/auth/domain/exception/ongi-auth.exception';

interface TokenPayload {
  token: string;
  expiresIn: Date;
}

@Injectable()
export class OngiAuthRepository implements IOngiAuthRepository {
  private ACCESS_TOKEN_EXPIRE_IN = 60 * 60; // 1 hour
  private REFRESH_TOKEN_EXPIRE_IN = 60 * 24 * 60 * 60; // 60 days

  constructor(
    @InjectRepository(OngiAuth)
    private readonly authRepository: Repository<OngiAuth>,

    private readonly jwtService: JwtService,
  ) {}

  async create(creator: OngiAuthCreator, user: OngiUser): Promise<OngiAuth> {
    const accessToken = this.getAccessToken(user);
    const refreshToken = this.getRefreshToken();

    return this.authRepository.save({
      type: creator.type,
      userId: creator.userId,
      accessToken: accessToken.token,
      accessTokenExpiresIn: accessToken.expiresIn,
      refreshToken: refreshToken.token,
      refreshTokenExpiresIn: refreshToken.expiresIn,
    });
  }

  async renewAccessToken(user: OngiUser, accessToken: string, refreshToken: string): Promise<OngiAuth> {
    const newAccessToken = this.getAccessToken(user);
    const updateResult = await this.authRepository.update(
      { accessToken, refreshToken },
      { accessToken: newAccessToken.token, accessTokenExpiresIn: newAccessToken.expiresIn },
    );
    if (!updateResult.affected) throw new OngiFailedToRenewToken();

    const auth = await this.authRepository.findOneBy({ accessToken: newAccessToken.token, refreshToken });
    if (!auth) throw new OngiAuthNotFound();

    return auth;
  }

  async renewTokens(user: OngiUser, accessToken: string, refreshToken: string): Promise<OngiAuth> {
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
    if (!updateResult.affected) throw new OngiFailedToRenewToken();

    const auth = await this.authRepository.findOneBy({ accessToken: newAccessToken.token, refreshToken: newRefreshToken.token });
    if (!auth) throw new OngiAuthNotFound();

    return auth;
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.authRepository.delete({ userId });
  }

  private getAccessToken(user: OngiUser): TokenPayload {
    // jwt.strategy 의 validate 가 payload.name 을 그대로 signature.name 으로 사용하므로 name 을 반드시 포함
    const token = this.jwtService.sign({ id: user.id, name: user.name }, { privateKey: process.env['JWT_TOKEN_KEY'], expiresIn: this.ACCESS_TOKEN_EXPIRE_IN });
    const expiresIn = new Date(Date.now() + this.ACCESS_TOKEN_EXPIRE_IN * 1000);

    return { token, expiresIn };
  }

  private getRefreshToken(): TokenPayload {
    const token = this.jwtService.sign({}, { privateKey: process.env['JWT_TOKEN_KEY'], expiresIn: this.REFRESH_TOKEN_EXPIRE_IN });
    const expiresIn = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRE_IN * 1000);

    return { token, expiresIn };
  }
}
