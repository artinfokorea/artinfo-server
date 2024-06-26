import { Injectable } from '@nestjs/common';
import { SignUpCommand } from '@/auth/dto/command/sign-up.command';
import { UserRepository } from '@/user/repository/user.repository';
import {
  EmailAlreadyExist,
  EmailAuthenticationDoesNotExist,
  GoogleAccessTokenIsNotValid,
  InvalidLoginInfo,
  KakaoAccessTokenIsNotValid,
  NaverAccessTokenIsNotValid,
  PasswordNotFound,
} from '@/auth/exception/auth.exception';
import * as bcrypt from 'bcrypt';
import { User } from '@/user/entity/user.entity';
import { EmailLoginCommand } from '@/auth/dto/command/email-login.command';
import { Auth, AUTH_TYPE, SNS_TYPE } from '@/auth/entity/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@/common/redis/redis.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  // private ACCESS_TOKEN_EXPIRE_IN = 1 * 60 * 60;
  private ACCESS_TOKEN_EXPIRE_IN = 2 * 30 * 24 * 60 * 60; // 임시 시간
  private REFRESH_TOKEN_EXPIRE_IN = 2 * 30 * 24 * 60 * 60;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(command: SignUpCommand): Promise<void> {
    const user = await this.userRepository.findByEmail(command.email);
    if (user) throw new EmailAlreadyExist();

    const verification = await this.redisService.getByKey(command.email);
    if (!verification) throw new EmailAuthenticationDoesNotExist();

    if (!command.password) throw new PasswordNotFound();
    const hashedPassword = await this.getHashedPassword(command.password);

    const createdUser = new User({
      name: command.name,
      nickname: command.nickname,
      email: command.email,
      password: hashedPassword,
      iconImageUrl: null,
    });

    await createdUser.save();
  }

  async loginByEmail(command: EmailLoginCommand): Promise<Auth> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) throw new InvalidLoginInfo();

    if (!user.password) throw new InvalidLoginInfo();
    const passwordMatching = await bcrypt.compare(command.password, user.password);
    if (!passwordMatching) throw new InvalidLoginInfo();

    const accessTokenExpiresIn = new Date(Date.now() + this.ACCESS_TOKEN_EXPIRE_IN * 1000);
    const refreshTokenExpiresIn = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRE_IN * 1000);

    const auth = new Auth({
      type: AUTH_TYPE.EMAIL,
      userId: user.id,
      accessToken: this.generateToken(this.ACCESS_TOKEN_EXPIRE_IN, { id: user.id, name: user.name, email: user.email }),
      accessTokenExpiresIn: accessTokenExpiresIn,
      refreshToken: this.generateToken(this.REFRESH_TOKEN_EXPIRE_IN),
      refreshTokenExpiresIn: refreshTokenExpiresIn,
    });

    await auth.save();

    return auth;
  }

  async loginBySns(token: string, type: SNS_TYPE): Promise<Auth> {
    // const user: User | null = null;
    console.log(type);
    // user = await this.getUserByKakao(token);

    await this.getUserByNaver(token);
    const user = await this.userRepository.findById(7);
    if (!user) throw new InvalidLoginInfo();
    const accessTokenExpiresIn = new Date(Date.now() + this.ACCESS_TOKEN_EXPIRE_IN * 1000);
    const refreshTokenExpiresIn = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRE_IN * 1000);

    const auth = new Auth({
      type: AUTH_TYPE.EMAIL,
      userId: user.id,
      accessToken: this.generateToken(this.ACCESS_TOKEN_EXPIRE_IN, { id: user.id, name: user.name, email: user.email }),
      accessTokenExpiresIn: accessTokenExpiresIn,
      refreshToken: this.generateToken(this.REFRESH_TOKEN_EXPIRE_IN),
      refreshTokenExpiresIn: refreshTokenExpiresIn,
    });

    await auth.save();

    return auth;
  }

  async getUserByKakao(accessToken: string): Promise<User> {
    let payload: any;
    try {
      const response = await axios({
        method: 'get',
        url: 'https://kapi.kakao.com/v2/user/me',
        headers: { Authorization: 'Bearer ' + accessToken },
      });

      payload = response.data;
      if (!payload) {
        throw new KakaoAccessTokenIsNotValid();
      }
      if (!payload.kakao_account) {
        throw new KakaoAccessTokenIsNotValid();
      }

      let user = await this.userRepository.findByEmail(payload.kakao_account.email);
      if (!user) {
        const createdUser = new User({
          name: payload.kakao_account.profile.nickname,
          nickname: payload.kakao_account.profile.nickname,
          email: payload.kakao_account.email,
          password: null,
          iconImageUrl: null,
        });

        user = await createdUser.save();
      }

      return user;
    } catch (e) {
      console.log(e.response.data.msg);
      throw new KakaoAccessTokenIsNotValid();
    }
  }

  async getUserByGoogle(token: string) {
    let payload: any;
    try {
      const res = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
      payload = res.data;
    } catch (e) {
      throw new GoogleAccessTokenIsNotValid();
    }

    const email = payload['email'];
    const name = payload['name'];
    const nickname = payload['email'].split('@')[0];
    const iconImageUrl = payload['picture'];

    let user = await this.userRepository.findByEmail(payload.kakao_account.email);
    if (!user) {
      const createdUser = new User({
        name: name,
        nickname: nickname,
        email: email,
        iconImageUrl: iconImageUrl,
        password: null,
      });

      user = await createdUser.save();
    }

    return user;
  }

  async getUserByNaver(accessToken: string) {
    const config = {
      method: 'get',
      url: 'https://openapi.naver.com/v1/nid/me',
      headers: { Authorization: 'Bearer ' + accessToken },
    };

    let payload: any;
    try {
      const response = await axios(config);
      payload = response.data?.response;
      if (payload == null) {
        throw new NaverAccessTokenIsNotValid();
      }
    } catch (e) {
      throw new NaverAccessTokenIsNotValid();
    }

    const email = payload.email;
    const name = payload.name;
    const nickname = payload.nickname;
    const iconImageUrl = payload.profile_image;

    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      const createdUser = new User({
        name: name,
        nickname: nickname,
        email: email,
        iconImageUrl: iconImageUrl,
        password: null,
      });

      user = await createdUser.save();
    }

    return user;
  }

  private getHashedPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
  };

  private generateToken(expiresIn: number, payload?: { id: number; name: string; email: string }): string {
    return this.jwtService.sign(
      payload ?? {}, //
      { privateKey: process.env['JWT_TOKEN_KEY'], expiresIn: expiresIn },
    );
  }
}
