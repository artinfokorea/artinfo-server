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

      const account = payload.kakao_account;

      return {
        email: account.email || null,
        name: account.profile?.nickname || null,
        snsId: String(payload.id),
        iconImageUrl: account.profile?.profile_image_url || null,
        gender: account.gender || null,
        ageRange: account.age_range || null,
        birthday: account.birthday || null,
        birthyear: account.birthyear || null,
        phone: this.formatKoreanPhone(account.phone_number),
      };
    } catch (e) {
      throw new AzeyoInvalidSnsToken();
    }
  }

  private formatKoreanPhone(phone: string | null | undefined): string | null {
    if (!phone) return null;
    // "+82 10-4028-7451" → "010-4028-7451"
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('82') && digits.length >= 11) {
      const local = '0' + digits.substring(2);
      return `${local.substring(0, 3)}-${local.substring(3, 7)}-${local.substring(7)}`;
    }
    return phone;
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

      console.log('[Naver UserInfo]', JSON.stringify(payload, null, 2));

      // 네이버 gender: "M" or "F" → "male" or "female"로 통일
      const genderMap: Record<string, string> = { M: 'male', F: 'female' };

      return {
        email: payload.email || null,
        name: payload.name || null,
        snsId: payload.id,
        iconImageUrl: payload.profile_image || null,
        gender: genderMap[payload.gender] || payload.gender || null,
        ageRange: payload.age || null,
        birthday: payload.birthday?.replace('-', '') || null,
        birthyear: payload.birthyear || null,
        phone: this.formatKoreanPhone(payload.mobile),
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
        gender: null,
        ageRange: null,
        birthday: null,
        birthyear: null,
        phone: null,
      };
    } catch (e) {
      throw new AzeyoInvalidSnsToken();
    }
  }
}
