import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { createPublicKey, JsonWebKey } from 'crypto';
import * as jwt from 'jsonwebtoken';
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
    } else if (type === ONGI_SNS_TYPE.APPLE) {
      return this.getAppleUserInfo(token);
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

  /**
   * Apple 로그인 — 앱이 넘긴 identity token(JWT)을 Apple 공개키(JWKS)로 직접 검증합니다.
   *
   * - iss: https://appleid.apple.com, aud: 앱 번들 ID (ONGI_APPLE_CLIENT_ID, 기본 com.ongifamily.app)
   * - 이름은 토큰에 없고 최초 로그인 1회만 앱에 내려오므로 요청의 name 으로 받습니다 (usecase 에서 처리).
   * - email 은 "Hide My Email" 선택 시 privaterelay.appleid.com 릴레이 주소가 옵니다.
   */
  private async getAppleUserInfo(identityToken: string): Promise<OngiSnsUserInfo> {
    try {
      const decoded = jwt.decode(identityToken, { complete: true });
      const kid = decoded?.header?.kid;
      if (!kid) throw new OngiInvalidSnsToken();

      const publicKey = await this.getApplePublicKey(kid);
      const audience = process.env['ONGI_APPLE_CLIENT_ID'] || 'com.ongifamily.app';
      const payload = jwt.verify(identityToken, publicKey, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience,
      }) as jwt.JwtPayload;

      if (!payload.sub) throw new OngiInvalidSnsToken();

      return {
        snsId: payload.sub,
        name: null,
        email: typeof payload['email'] === 'string' ? payload['email'] : null,
        iconImageUrl: null,
      };
    } catch (e) {
      throw new OngiInvalidSnsToken();
    }
  }

  private appleKeysCache: { keys: AppleJwk[]; fetchedAt: number } | null = null;

  /** Apple JWKS 는 드물게 회전되므로 1시간 캐시, 모르는 kid 가 오면 즉시 재조회 */
  private async getApplePublicKey(kid: string): Promise<string> {
    const findKey = () => this.appleKeysCache?.keys.find((k) => k.kid === kid);

    const isFresh = this.appleKeysCache && Date.now() - this.appleKeysCache.fetchedAt < 60 * 60 * 1000;
    let key = isFresh ? findKey() : undefined;
    if (!key) {
      const res = await axios.get<{ keys: AppleJwk[] }>('https://appleid.apple.com/auth/keys', { timeout: 5000 });
      this.appleKeysCache = { keys: res.data.keys, fetchedAt: Date.now() };
      key = findKey();
    }
    if (!key) throw new OngiInvalidSnsToken();

    return createPublicKey({ key: key as unknown as JsonWebKey, format: 'jwk' }).export({ type: 'spki', format: 'pem' }).toString();
  }
}

interface AppleJwk {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}
