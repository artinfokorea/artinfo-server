import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { HOLY365_SNS_PROVIDER } from '@/holy365/auth/domain/service/holy365-oauth';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

export interface Holy365SnsProfile {
  snsId: string;
  name: string | null;
  email: string | null;
  iconImageUrl: string | null;
}

export interface Holy365SnsCredentials {
  clientId: string;
  clientSecret: string;
}

const ENV_PREFIX: Record<HOLY365_SNS_PROVIDER, string> = {
  [HOLY365_SNS_PROVIDER.GOOGLE]: 'HOLY365_GOOGLE',
  [HOLY365_SNS_PROVIDER.KAKAO]: 'HOLY365_KAKAO',
  [HOLY365_SNS_PROVIDER.NAVER]: 'HOLY365_NAVER',
};

/** 웹 OAuth — 콜백에서 받은 authorization code 를 토큰으로 바꾸고 프로필을 읽는다 */
@Injectable()
export class Holy365OAuthClient {
  private readonly logger = new Logger(Holy365OAuthClient.name);

  /** 환경변수 HOLY365_{GOOGLE|KAKAO|NAVER}_CLIENT_ID / _CLIENT_SECRET. 카카오는 secret 을 쓰지 않으면 비워도 된다 */
  credentials(provider: HOLY365_SNS_PROVIDER): Holy365SnsCredentials | null {
    const clientId = process.env[`${ENV_PREFIX[provider]}_CLIENT_ID`] ?? '';
    const clientSecret = process.env[`${ENV_PREFIX[provider]}_CLIENT_SECRET`] ?? '';
    if (!clientId || (provider !== HOLY365_SNS_PROVIDER.KAKAO && !clientSecret)) return null;

    return { clientId, clientSecret };
  }

  async fetchProfile(provider: HOLY365_SNS_PROVIDER, code: string, redirectUri: string, state: string): Promise<Holy365SnsProfile> {
    const credentials = this.credentials(provider);
    if (!credentials) throw Holy365Errors.snsNotConfigured();

    try {
      const accessToken = await this.exchange(provider, credentials, code, redirectUri, state);

      return await this.profile(provider, accessToken);
    } catch (error) {
      const detail = axios.isAxiosError(error) ? JSON.stringify(error.response?.data ?? error.message) : String(error);
      this.logger.warn(`holy365 ${provider} oauth failed: ${detail}`);
      throw Holy365Errors.snsFailed();
    }
  }

  private async exchange(provider: HOLY365_SNS_PROVIDER, { clientId, clientSecret }: Holy365SnsCredentials, code: string, redirectUri: string, state: string) {
    const form = new URLSearchParams({ grant_type: 'authorization_code', client_id: clientId, code, redirect_uri: redirectUri });
    if (clientSecret) form.set('client_secret', clientSecret);
    if (provider === HOLY365_SNS_PROVIDER.NAVER) form.set('state', state);

    const endpoint = {
      [HOLY365_SNS_PROVIDER.GOOGLE]: 'https://oauth2.googleapis.com/token',
      [HOLY365_SNS_PROVIDER.KAKAO]: 'https://kauth.kakao.com/oauth/token',
      [HOLY365_SNS_PROVIDER.NAVER]: 'https://nid.naver.com/oauth2.0/token',
    }[provider];

    const res = await axios.post(endpoint, form.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }, timeout: 8000 });
    const accessToken = res.data?.access_token;
    if (!accessToken) throw new Error(`no access_token: ${JSON.stringify(res.data)}`);

    return accessToken as string;
  }

  private async profile(provider: HOLY365_SNS_PROVIDER, accessToken: string): Promise<Holy365SnsProfile> {
    const headers = { Authorization: `Bearer ${accessToken}` };

    if (provider === HOLY365_SNS_PROVIDER.GOOGLE) {
      const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers, timeout: 8000 });
      if (!data?.sub) throw new Error('google: no sub');

      return { snsId: String(data.sub), name: data.name ?? null, email: data.email ?? null, iconImageUrl: data.picture ?? null };
    }

    if (provider === HOLY365_SNS_PROVIDER.KAKAO) {
      const { data } = await axios.get('https://kapi.kakao.com/v2/user/me', { headers, timeout: 8000 });
      if (!data?.id) throw new Error('kakao: no id');
      const account = data.kakao_account;

      return {
        snsId: String(data.id),
        name: account?.profile?.nickname ?? null,
        email: account?.email ?? null,
        iconImageUrl: account?.profile?.profile_image_url ?? null,
      };
    }

    const { data } = await axios.get('https://openapi.naver.com/v1/nid/me', { headers, timeout: 8000 });
    const payload = data?.response;
    if (!payload?.id) throw new Error('naver: no id');

    return {
      snsId: String(payload.id),
      name: payload.name ?? payload.nickname ?? null,
      email: payload.email ?? null,
      iconImageUrl: payload.profile_image ?? null,
    };
  }
}
