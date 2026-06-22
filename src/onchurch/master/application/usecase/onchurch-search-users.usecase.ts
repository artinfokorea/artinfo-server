import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE, OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';

const SEARCH_LIMIT = 20;

/**
 * 마스터 전용 사용자 검색. 오너 이관 대상 후보(마스터 제외)를 이름·아이디·연락처로 찾는다.
 * 검색어가 비어 있으면 전체 사용자를 쏟아내지 않도록 빈 목록을 반환한다.
 */
@Injectable()
export class OnchurchSearchUsersUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
  ) {}

  async execute(requesterId: number, keyword: string): Promise<OnchurchUser[]> {
    const requester = await this.userRepository.findOneOrThrowById(requesterId);
    if (requester.role !== ONCHURCH_USER_ROLE.MASTER) {
      throw new ForbiddenException('마스터 권한이 필요합니다.');
    }

    const kw = keyword.trim();
    if (!kw) return [];

    return this.userRepository.searchCandidates(kw, SEARCH_LIMIT);
  }
}
