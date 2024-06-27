import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth, AuthCreator } from '@/auth/entity/auth.entity';
import { Repository } from 'typeorm';
import { AuthNotFound, FailedToRenewToken, InvalidAccessToken } from '@/auth/exception/auth.exception';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/user/entity/user.entity';

interface TokenPayload {
  token: string;
  expiresIn: Date;
}

@Injectable()
export class AuthRepository {
  // private ACCESS_TOKEN_EXPIRE_IN =  30 * 60;
  private ACCESS_TOKEN_EXPIRE_IN = 2 * 30 * 24 * 60 * 60; // 임시 시간
  private REFRESH_TOKEN_EXPIRE_IN = 60 * 60;

  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,

    private readonly jwtService: JwtService,
  ) {}

  async create(create: AuthCreator): Promise<Auth> {
    const accessToken = this.getAccessToken(create.user);
    const refreshToken = this.getRefreshToken();

    return this.authRepository.save({
      type: create.type,
      userId: create.user.id,
      accessToken: accessToken.token,
      accessTokenExpiresIn: accessToken.expiresIn,
      refreshToken: refreshToken.token,
      refreshTokenExpiresIn: refreshToken.expiresIn,
    });
  }

  async findOneOrThrowByTokens(accessToken: string, refreshToken: string): Promise<Auth> {
    const auth = await this.authRepository.findOneBy({ accessToken: accessToken, refreshToken: refreshToken });
    if (!auth) throw new InvalidAccessToken();

    return auth;
  }

  async renewAccessToken(user: User, accessToken: string, refreshToken: string): Promise<Auth> {
    const newAccessToken = this.getAccessToken(user);
    const updateResult = await this.authRepository.update(
      { accessToken: accessToken, refreshToken: refreshToken },
      { accessToken: newAccessToken.token, accessTokenExpiresIn: newAccessToken.expiresIn },
    );
    if (!updateResult.affected) throw new FailedToRenewToken();

    const auth = await this.authRepository.findOneBy({ accessToken: newAccessToken.token, refreshToken: refreshToken });
    if (!auth) throw new AuthNotFound();

    return auth;
  }

  async renewTokens(user: User, accessToken: string, refreshToken: string): Promise<Auth> {
    const newAccessToken = this.getAccessToken(user);
    const newRefreshToken = this.getRefreshToken();

    const updateResult = await this.authRepository.update(
      { accessToken: accessToken, refreshToken: refreshToken },
      {
        accessToken: newAccessToken.token,
        accessTokenExpiresIn: newAccessToken.expiresIn,
        refreshToken: newRefreshToken.token,
        refreshTokenExpiresIn: newRefreshToken.expiresIn,
      },
    );
    if (!updateResult.affected) throw new FailedToRenewToken();

    const auth = await this.authRepository.findOneBy({ accessToken: newAccessToken.token, refreshToken: newRefreshToken.token });
    if (!auth) throw new AuthNotFound();

    return auth;
  }

  private getAccessToken(user: User): TokenPayload {
    const token = this.jwtService.sign(
      { id: user.id, name: user.name, email: user.email },
      { privateKey: process.env['JWT_TOKEN_KEY'], expiresIn: this.ACCESS_TOKEN_EXPIRE_IN },
    );
    const expiresIn = new Date(Date.now() + this.ACCESS_TOKEN_EXPIRE_IN * 1000);

    return { token: token, expiresIn: expiresIn };
  }

  private getRefreshToken(): TokenPayload {
    const token = this.jwtService.sign({}, { privateKey: process.env['JWT_TOKEN_KEY'], expiresIn: this.REFRESH_TOKEN_EXPIRE_IN });
    const expiresIn = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRE_IN * 1000);

    return { token: token, expiresIn: expiresIn };
  }
}
