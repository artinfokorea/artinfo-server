import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { IAzeyoAuthRepository } from '@/azeyo/auth/domain/repository/azeyo-auth.repository.interface';
import { AzeyoAuth, AzeyoAuthCreator } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';
import { AzeyoAuthNotFound, AzeyoFailedToRenewToken } from '@/azeyo/auth/domain/exception/azeyo-auth.exception';

interface TokenPayload {
  token: string;
  expiresIn: Date;
}

@Injectable()
export class AzeyoAuthRepository implements IAzeyoAuthRepository {
  private ACCESS_TOKEN_EXPIRE_IN = 2 * 30 * 24 * 60 * 60; // 60 days
  private REFRESH_TOKEN_EXPIRE_IN = 60 * 60; // 1 hour

  constructor(
    @InjectRepository(AzeyoAuth)
    private readonly authRepository: Repository<AzeyoAuth>,

    private readonly jwtService: JwtService,
  ) {}

  async create(creator: AzeyoAuthCreator, user: AzeyoUser): Promise<AzeyoAuth> {
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

  async renewAccessToken(user: AzeyoUser, accessToken: string, refreshToken: string): Promise<AzeyoAuth> {
    const newAccessToken = this.getAccessToken(user);
    const updateResult = await this.authRepository.update(
      { accessToken, refreshToken },
      { accessToken: newAccessToken.token, accessTokenExpiresIn: newAccessToken.expiresIn },
    );
    if (!updateResult.affected) throw new AzeyoFailedToRenewToken();

    const auth = await this.authRepository.findOneBy({ accessToken: newAccessToken.token, refreshToken });
    if (!auth) throw new AzeyoAuthNotFound();

    return auth;
  }

  async renewTokens(user: AzeyoUser, accessToken: string, refreshToken: string): Promise<AzeyoAuth> {
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
    if (!updateResult.affected) throw new AzeyoFailedToRenewToken();

    const auth = await this.authRepository.findOneBy({ accessToken: newAccessToken.token, refreshToken: newRefreshToken.token });
    if (!auth) throw new AzeyoAuthNotFound();

    return auth;
  }

  private getAccessToken(user: AzeyoUser): TokenPayload {
    const token = this.jwtService.sign(
      { id: user.id, nickname: user.nickname },
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
