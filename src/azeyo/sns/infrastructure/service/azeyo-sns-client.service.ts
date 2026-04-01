import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { IAzeyoSnsClient } from '@/azeyo/sns/domain/service/azeyo-sns-client.interface';
import { AZEYO_SNS_TYPE } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { SnsUserInfo } from '@/azeyo/sns/domain/dto/sns-user-info';
import { AzeyoInvalidSnsToken } from '@/azeyo/auth/domain/exception/azeyo-auth.exception';

@Injectable()
export class AzeyoSnsClientService implements IAzeyoSnsClient {
  async getUserInfo(token: string, type: AZEYO_SNS_TYPE): Promise<SnsUserInfo> {
    if (type === AZEYO_SNS_TYPE.KAKAO) {
      return this.getKakaoUserInfo(token);
    } else if (type === AZEYO_SNS_TYPE.NAVER) {
      return this.getNaverUserInfo(token);
    } else if (type === AZEYO_SNS_TYPE.GOOGLE) {
      return this.getGoogleUserInfo(token);
    }

    throw new AzeyoInvalidSnsToken();
  }

  private async getKakaoUserInfo(accessToken: string): Promise<SnsUserInfo> {
    try {
      const response = await axios({
        method: 'get',
        url: 'https://kapi.kakao.com/v2/user/me',
        headers: { Authorization: 'Bearer ' + accessToken },
      });

      const payload = response.data;
      if (!payload || !payload.kakao_account) {
        throw new AzeyoInvalidSnsToken();
      }

      return {
        email: payload.kakao_account.email || null,
        name: payload.kakao_account.profile?.nickname || null,
        snsId: String(payload.id),
        iconImageUrl: payload.kakao_account.profile?.profile_image_url || null,
      };
    } catch (e) {
      throw new AzeyoInvalidSnsToken();
    }
  }

  private async getNaverUserInfo(accessToken: string): Promise<SnsUserInfo> {
    try {
      const response = await axios({
        method: 'get',
        url: 'https://openapi.naver.com/v1/nid/me',
        headers: { Authorization: 'Bearer ' + accessToken },
      });

      const payload = response.data?.response;
      if (!payload) {
        throw new AzeyoInvalidSnsToken();
      }

      return {
        email: payload.email || null,
        name: payload.name || null,
        snsId: payload.id,
        iconImageUrl: payload.profile_image || null,
      };
    } catch (e) {
      throw new AzeyoInvalidSnsToken();
    }
  }

  private async getGoogleUserInfo(token: string): Promise<SnsUserInfo> {
    try {
      const res = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
      const payload = res.data;

      return {
        email: payload.email || null,
        name: payload.name || null,
        snsId: payload.sub,
        iconImageUrl: payload.picture || null,
      };
    } catch (e) {
      throw new AzeyoInvalidSnsToken();
    }
  }
}
