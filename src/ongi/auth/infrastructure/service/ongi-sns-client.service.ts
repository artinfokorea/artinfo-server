import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { IOngiSnsClient, OngiSnsUserInfo } from '@/ongi/auth/domain/service/ongi-sns-client.interface';
import { ONGI_SNS_TYPE } from '@/ongi/user/domain/entity/ongi-user.entity';
import { OngiInvalidSnsToken } from '@/ongi/auth/domain/exception/ongi-auth.exception';

@Injectable()
export class OngiSnsClientService implements IOngiSnsClient {
  async getUserInfo(token: string, type: ONGI_SNS_TYPE): Promise<OngiSnsUserInfo> {
    if (type === ONGI_SNS_TYPE.KAKAO) {
      return this.getKakaoUserInfo(token);
    } else if (type === ONGI_SNS_TYPE.NAVER) {
      return this.getNaverUserInfo(token);
    } else if (type === ONGI_SNS_TYPE.GOOGLE) {
      return this.getGoogleUserInfo(token);
    }

    throw new OngiInvalidSnsToken();
  }

  private async getKakaoUserInfo(accessToken: string): Promise<OngiSnsUserInfo> {
    try {
      const response = await axios({
        method: 'get',
        url: 'https://kapi.kakao.com/v2/user/me',
        headers: { Authorization: 'Bearer ' + accessToken },
      });

      const payload = response.data;
      if (!payload || !payload.id) {
        throw new OngiInvalidSnsToken();
      }

      const account = payload.kakao_account;

      return {
        snsId: String(payload.id),
        name: account?.profile?.nickname || null,
        email: account?.email || null,
        iconImageUrl: account?.profile?.profile_image_url || null,
      };
    } catch (e) {
      throw new OngiInvalidSnsToken();
    }
  }

  private async getNaverUserInfo(accessToken: string): Promise<OngiSnsUserInfo> {
    try {
      const response = await axios({
        method: 'get',
        url: 'https://openapi.naver.com/v1/nid/me',
        headers: { Authorization: 'Bearer ' + accessToken },
      });

      const payload = response.data?.response;
      if (!payload) {
        throw new OngiInvalidSnsToken();
      }

      return {
        snsId: payload.id,
        name: payload.name || payload.nickname || null,
        email: payload.email || null,
        iconImageUrl: payload.profile_image || null,
      };
    } catch (e) {
      throw new OngiInvalidSnsToken();
    }
  }

  private async getGoogleUserInfo(token: string): Promise<OngiSnsUserInfo> {
    try {
      const res = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
      const payload = res.data;
      if (!payload || !payload.sub) {
        throw new OngiInvalidSnsToken();
      }

      return {
        snsId: payload.sub,
        name: payload.name || null,
        email: payload.email || null,
        iconImageUrl: payload.picture || null,
      };
    } catch (e) {
      throw new OngiInvalidSnsToken();
    }
  }
}
