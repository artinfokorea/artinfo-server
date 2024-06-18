import { Injectable } from '@nestjs/common';
import { SignUpCommand } from '@/auth/dto/command/sign-up.command';
import { UserRepository } from '@/user/repository/user.repository';
import {
  EmailAlreadyExist,
  EmailAuthenticationDoesNotExist,
  InvalidLoginInfo,
  KakaoAccessTokenIsNotValid,
  PasswordNotFound,
} from '@/auth/exception/auth.exception';
import * as bcrypt from 'bcrypt';
import { User } from '@/user/entity/user.entity';
import { EmailLoginCommand } from '@/auth/dto/command/email-login.command';
import { Auth, AUTH_TYPE } from '@/auth/entity/auth.entity';
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
      email: command.email,
      password: hashedPassword,
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

  async loginBySns(token: string, type: AUTH_TYPE) {
    if (type === AUTH_TYPE.KAKAO) {
      this.getKakaoProfile(token);
    }

    const user = await this.userRepository.findById(8);
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

  async getKakaoProfile(accessToken: string) {
    // const config = {
    //   method: 'get',
    //   url: 'https://kapi.kakao.com/v2/user/me',
    //   headers: { Authorization: 'Bearer ' + accessToken },
    // };
    //
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

      console.log(payload);

      //   const configToCheckAK = {
      //     method: 'get',
      //     url: `https://kapi.kakao.com/v2/user/me?target_id_type=user_id&target_id=${payload.id}&secure_resource=true`,
      //     headers: { Authorization: 'KakaoAK ' + TheEgoSnsConfig.KAKAO_ADMIN_KEY },
      //   };
      //
      //   const responseToCheck = await axios(configToCheckAK);
      //   const payloadToCheck = responseToCheck.data;
      //   if (!payloadToCheck) {
      //     throw new KakaoAccessTokenIsNotValid();
      //   }
      //   if (!payloadToCheck.kakao_account) {
      //     throw new KakaoAccessTokenIsNotValid();
      //   }
    } catch (e) {
      console.log(e.response.data.msg);
      throw new KakaoAccessTokenIsNotValid();
    }
    //
    //   if (payload.kakao_account.is_email_verified == false) {
    //     throw new TheEgoError(TheEgoSnsErrorCodes.KAKAO_EMAIL_IS_NOT_VERIFIED);
    //   }
    //
    //   const uid = String(payload.id);
    //   const email = payload.kakao_account.email;
    //   const name = payload.kakao_account.profile?.nickname;
    //   const iconImageUrl = payload.kakao_account.profile?.profile_image_url;
    //   const birthYear = payload.kakao_account.birthyear;
    //   const birthday = payload.kakao_account.birthday;
    //   const birthdayType = payload.kakao_account.birthday_type;
    //   const gender = payload.kakao_account.gender?.toUpperCase();
    //
    //   if (uid == null) throw new TheEgoError(TheEgoSnsErrorCodes.KAKAO_ID_DOES_NOT_EXIST);
    //   if (email == null) throw new TheEgoError(TheEgoSnsErrorCodes.KAKAO_EMAIL_DOES_NOT_EXIST);
    //
    //   return new TheEgoSnsProfile(TheEgoSnsType.KAKAO, uid, email, name, iconImageUrl, birthYear, birthday, birthdayType, gender);
  }

  // getGoogleProfile = async (token: string, deviceType: TheEgoDeviceType): Promise<TheEgoSnsProfile> => {
  //   let payload: any;
  //   if (deviceType === TheEgoDeviceType.WEB) {
  //     try {
  //       const res = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
  //       payload = res.data;
  //     } catch (e) {
  //       throw new TheEgoError(TheEgoSnsErrorCodes.GOOGLE_ID_TOKEN_IS_NOT_VALID);
  //     }
  //   } else {
  //     const clientId = this.getGoogleClientIdByDeviceType(deviceType);
  //
  //     const client = new OAuth2Client(clientId);
  //
  //     try {
  //       const ticket = await client.verifyIdToken({
  //         idToken: token,
  //         // Specify the CLIENT_ID of the app that accesses the backend
  //         audience: clientId,
  //         // Or, if multiple clients access the backend:
  //         //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  //       });
  //       payload = ticket.getPayload();
  //     } catch (e) {
  //       throw new TheEgoError(TheEgoSnsErrorCodes.GOOGLE_ID_TOKEN_IS_NOT_VALID);
  //     }
  //   }
  //
  //   const uid = payload['sub'];
  //   const email = payload['email'];
  //   const name = payload['name'];
  //   const iconImageUrl = payload['picture'];
  //
  //   if (uid == null) throw new TheEgoError(TheEgoSnsErrorCodes.GOOGLE_ID_DOES_NOT_EXIST);
  //   if (email == null) throw new TheEgoError(TheEgoSnsErrorCodes.GOOGLE_EMAIL_DOES_NOT_EXIST);
  //
  //   return new TheEgoSnsProfile(TheEgoSnsType.GOOGLE, uid, email, name, iconImageUrl);
  // };

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // getNaverProfile = async (accessToken: string, _deviceType: TheEgoDeviceType): Promise<TheEgoSnsProfile> => {
  //   const config = {
  //     method: 'get',
  //     url: 'https://openapi.naver.com/v1/nid/me',
  //     headers: { Authorization: 'Bearer ' + accessToken },
  //   };
  //
  //   let payload: any;
  //   try {
  //     const response = await axios(config);
  //     payload = response.data?.response;
  //     if (payload == null) {
  //       throw new TheEgoError(TheEgoSnsErrorCodes.NAVER_ACCESS_TOKEN_IS_NOT_VALID);
  //     }
  //   } catch (e) {
  //     throw new TheEgoError(TheEgoSnsErrorCodes.NAVER_ACCESS_TOKEN_IS_NOT_VALID);
  //   }
  //
  //   const uid = payload.id;
  //   const email = payload.email;
  //   const name = payload.name;
  //   const iconImageUrl = payload.profile_image;
  //
  //   if (uid == null) throw new TheEgoError(TheEgoSnsErrorCodes.NAVER_ID_DOES_NOT_EXIST);
  //   if (email == null) throw new TheEgoError(TheEgoSnsErrorCodes.NAVER_EMAIL_DOES_NOT_EXIST);
  //
  //   return new TheEgoSnsProfile(TheEgoSnsType.NAVER, uid, email, name, iconImageUrl);
  // };

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
