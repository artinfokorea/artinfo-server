import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_CHURCH_REPOSITORY,
  IOnchurchChurchRepository,
  OnchurchChurchSearchRow,
} from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';

const SEARCH_LIMIT = 30;

// 앱 회원가입의 교회 찾기 — 운영 중인 교회를 이름으로 검색한다.
@Injectable()
export class OnchurchSearchPublicChurchesUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(keyword: string | undefined): Promise<OnchurchChurchSearchRow[]> {
    const trimmed = (keyword ?? '').trim();
    if (!trimmed) return [];
    return this.churchRepository.searchPublishedByName(trimmed, SEARCH_LIMIT);
  }
}
