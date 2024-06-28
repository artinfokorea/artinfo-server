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
import { RefreshAccessTokenCommand } from '@/auth/dto/command/refresh-access-token.command';
import { AuthRepository } from '@/auth/repository/auth.repository';
import { UserCreator } from '@/user/repository/opertaion/user.creator';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(command: SignUpCommand): Promise<void> {
    const user = await this.userRepository.findByEmail(command.email);
    if (user) throw new EmailAlreadyExist();

    const verification = await this.redisService.getByKey(command.email);
    if (!verification) throw new EmailAuthenticationDoesNotExist();

    if (!command.password) throw new PasswordNotFound();

    const userCreator = new UserCreator({
      name: command.name,
      nickname: command.nickname,
      email: command.email,
      password: command.password,
      iconImageUrl: null,
    });

    await this.userRepository.create(userCreator);
  }

  async loginByEmail(command: EmailLoginCommand): Promise<Auth> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) throw new InvalidLoginInfo();

    if (!user.password) throw new InvalidLoginInfo();
    const passwordMatching = await bcrypt.compare(command.password, user.password);
    if (!passwordMatching) throw new InvalidLoginInfo();

    return await this.authRepository.create({ type: AUTH_TYPE.EMAIL, user: user });
  }

  async loginBySns(token: string, type: SNS_TYPE): Promise<Auth> {
    let user: User | null = null;
    let authType: AUTH_TYPE | null = null;

    if (type === SNS_TYPE.GOOGLE) {
      user = await this.getUserByGoogle(token);
      authType = AUTH_TYPE.GOOGLE;
    } else if (type === SNS_TYPE.NAVER) {
      user = await this.getUserByNaver(token);
      authType = AUTH_TYPE.NAVER;
    } else if (type === SNS_TYPE.KAKAO) {
      user = await this.getUserByKakao(token);
      authType = AUTH_TYPE.KAKAO;
    } else {
      throw new InvalidLoginInfo();
    }

    return await this.authRepository.create({ type: authType, user: user });
  }

  async refreshTokens(command: RefreshAccessTokenCommand): Promise<Auth> {
    const decodedToken = await this.jwtService.verify(command.refreshToken, { secret: process.env.JWT_TOKEN_KEY });
    const { id, exp } = decodedToken;

    const redisKey = `USER:REFRESH=${id}`;
    const refetchAuth = await this.redisService.getByKey(redisKey);

    if (!refetchAuth) {
      const user = await this.userRepository.findOneOrThrowById(id);
      let auth: Auth | null = null;

      const currentTime = Math.floor(Date.now() / 1000);
      const oneHourInSeconds = 3600;
      if (exp - currentTime < oneHourInSeconds) {
        auth = await this.authRepository.renewTokens(user, command.accessToken, command.refreshToken);
      } else {
        auth = await this.authRepository.renewAccessToken(user, command.accessToken, command.refreshToken);
      }

      await this.redisService.setValue({
        key: redisKey,
        value: auth,
        ttl: 3,
      });

      return auth;
    } else {
      return refetchAuth as Auth;
    }
  }

  private async getUserByKakao(accessToken: string): Promise<User> {
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
        const userCreator = new UserCreator({
          name: payload.kakao_account.profile.nickname,
          nickname: payload.kakao_account.profile.nickname,
          email: payload.kakao_account.email,
          password: null,
          iconImageUrl: null,
        });

        const userId = await this.userRepository.create(userCreator);
        user = await this.userRepository.findOneOrThrowById(userId);
      }

      return user;
    } catch (e) {
      throw new KakaoAccessTokenIsNotValid();
    }
  }

  private async getUserByGoogle(token: string) {
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
      const userCreator = new UserCreator({
        name: name,
        nickname: nickname,
        email: email,
        iconImageUrl: iconImageUrl,
        password: null,
      });

      const userId = await this.userRepository.create(userCreator);
      user = await this.userRepository.findOneOrThrowById(userId);
    }

    return user;
  }

  private async getUserByNaver(accessToken: string) {
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
      const userCreator = new UserCreator({
        name: name,
        nickname: nickname,
        email: email,
        iconImageUrl: iconImageUrl,
        password: null,
      });

      const userId = await this.userRepository.create(userCreator);
      user = await this.userRepository.findOneOrThrowById(userId);
    }

    return user;
  }
}
