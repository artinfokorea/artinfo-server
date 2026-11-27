import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { regionOfAddress } from '@/holy365/social/domain/holy365-church-name';

export interface Holy365KakaoPlace {
  placeId: string;
  name: string;
  address: string;
  region: string;
}

/**
 * 카카오 로컬 키워드 검색으로 실제 교회를 찾는다. 키는 HOLY365_KAKAO_REST_KEY, 없으면 카카오 로그인용 REST 키(HOLY365_KAKAO_CLIENT_ID).
 * 키가 없거나 실패하면 빈 목록 — 이미 등록된 교회 검색과 직접 등록은 그대로 된다.
 */
@Injectable()
export class Holy365KakaoPlaceClient {
  private readonly logger = new Logger(Holy365KakaoPlaceClient.name);

  async searchChurches(query: string): Promise<Holy365KakaoPlace[]> {
    const key = process.env['HOLY365_KAKAO_REST_KEY'] || process.env['HOLY365_KAKAO_CLIENT_ID'];
    if (!key) return [];

    try {
      const keyword = /교회|church/i.test(query) ? query : `${query} 교회`;
      const { data } = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
        headers: { Authorization: `KakaoAK ${key}` },
        params: { query: keyword, size: 10 },
        timeout: 5000,
      });

      return (data?.documents ?? [])
        .filter((doc: { category_name?: string; place_name?: string }) => /교회|성당|종교/.test(doc.category_name ?? '') || /교회/.test(doc.place_name ?? ''))
        .map((doc: { id: string; place_name: string; road_address_name?: string; address_name?: string }) => {
          const address = doc.road_address_name || doc.address_name || '';
          return { placeId: String(doc.id), name: doc.place_name, address, region: regionOfAddress(doc.address_name || address) };
        });
    } catch (error) {
      this.logger.warn(`holy365 kakao place search failed: ${axios.isAxiosError(error) ? (error.response?.status ?? error.message) : String(error)}`);
      return [];
    }
  }
}
