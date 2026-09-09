import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ISalpyeoSnsClient, SalpyeoSnsUserInfo } from '@/salpyeo/auth/domain/service/salpyeo-sns-client.interface';
import { SALPYEO_SNS_TYPE } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { SalpyeoInvalidSnsToken } from '@/salpyeo/auth/domain/exception/salpyeo-auth.exception';

/**
 * 프론트(Google Identity Services)가 받아온 access token 을 구글에 되물어 사용자를 확인한다.
 * 서버가 리디렉션·코드 교환을 하지 않으므로 client secret 은 쓰지 않는다 (온기와 같은 방식).
 */
@Injectable()
export class SalpyeoSnsClientService implements ISalpyeoSnsClient {
  async getUserInfo(token: string, type: SALPYEO_SNS_TYPE): Promise<SalpyeoSnsUserInfo> {
    if (type === SALPYEO_SNS_TYPE.GOOGLE) {
      return this.getGoogleUserInfo(token);
    }

    throw new SalpyeoInvalidSnsToken();
  }

  private async getGoogleUserInfo(accessToken: string): Promise<SalpyeoSnsUserInfo> {
    try {
      const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 5000,
      });
      const payload = res.data;
      if (!payload?.sub) throw new SalpyeoInvalidSnsToken();

      return {
        snsId: String(payload.sub),
        name: payload.name || null,
        email: payload.email || null,
        iconImageUrl: payload.picture || null,
      };
    } catch (e) {
      throw new SalpyeoInvalidSnsToken();
    }
  }
}
