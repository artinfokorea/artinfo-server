import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpCommand } from '@/auth/dto/command/sign-up.command';
import { UserRepository } from '@/user/repository/user.repository';
import {
  EmailAlreadyExist,
  EmailAuthenticationDoesNotExist,
  GoogleAccessTokenIsNotValid,
  InvalidLoginInfo,
  KakaoAccessTokenIsNotValid,
  NaverAccessTokenIsNotValid,
  AppleIdentityTokenIsNotValid,
  PasswordNotFound,
} from '@/auth/exception/auth.exception';
import * as bcrypt from 'bcrypt';
import { User } from '@/user/entity/user.entity';
import { EmailLoginCommand } from '@/auth/dto/command/email-login.command';
import { Auth, AUTH_TYPE, SNS_TYPE } from '@/auth/entity/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import axios from 'axios';
import { RefreshAccessTokenCommand } from '@/auth/dto/command/refresh-access-token.command';
import { AuthRepository } from '@/auth/repository/auth.repository';
import { UserCreator } from '@/user/repository/opertaion/user.creator';
import { AppleIdentityTokenVerifier } from '@/auth/service/apple-identity-token.verifier';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
    private readonly redisRepository: RedisRepository,
    private readonly jwtService: JwtService,
    private readonly appleIdentityTokenVerifier: AppleIdentityTokenVerifier,
  ) {}

  async signup(command: SignUpCommand): Promise<void> {
    const user = await this.userRepository.findByEmail(command.email);
    if (user) throw new EmailAlreadyExist();

    const verification = await this.redisRepository.getByKey(command.email);
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

  async loginBySns(token: string, type: SNS_TYPE, name: string | null = null): Promise<Auth> {
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
    } else if (type === SNS_TYPE.APPLE) {
      user = await this.getUserByApple(token, name);
      authType = AUTH_TYPE.APPLE;
    } else {
      throw new InvalidLoginInfo();
    }

    return await this.authRepository.create({ type: authType, user: user });
  }

  async refreshTokens(command: RefreshAccessTokenCommand): Promise<Auth> {
    let decodedToken: any;
    try {
      decodedToken = await this.jwtService.verify(command.refreshToken, { secret: process.env.JWT_TOKEN_KEY });
    } catch {
      throw new UnauthorizedException({ code: 'AUTH-010', message: '토큰이 만료되었습니다.' });
    }
    const { id, exp } = decodedToken;

    const redisKey = `USER:REFRESH=${id}`;
    const refetchAuth = await this.redisRepository.getByKey(redisKey);

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

      await this.redisRepository.setValue({
        key: redisKey,
        value: auth,
        ttl: 3,
      });

      return auth;
    } else {
      return refetchAuth as Auth;
    }
  }

  /**
   * Apple 로그인 — identity token 을 검증해 email 로 회원을 찾고, 없으면 가입시킨다.
   * 이름은 Apple 이 최초 1회만 앱에 주므로 요청 name 을 쓰고, 없으면 이메일 앞부분을 쓴다 (구글과 같음).
   */
  private async getUserByApple(identityToken: string, name: string | null): Promise<User> {
    const identity = await this.appleIdentityTokenVerifier.verify(identityToken);
    if (!identity.email) {
      throw new AppleIdentityTokenIsNotValid();
    }

    let user = await this.userRepository.findByEmail(identity.email);
    if (!user) {
      const fallbackName = identity.email.split('@')[0];
      const displayName = name?.trim() || fallbackName;
      const userCreator = new UserCreator({
        name: displayName,
        nickname: displayName,
        email: identity.email,
        password: null,
        iconImageUrl: null,
      });

      const userId = await this.userRepository.create(userCreator);
      user = await this.userRepository.findOneOrThrowById(userId);
    }

    return user;
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
    const name = payload['email'].split('@')[0];
    const nickname = payload['email'].split('@')[0];
    const iconImageUrl = payload['picture'];

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
