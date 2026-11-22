import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchChurchNotFound } from '@/onchurch/church/domain/exception/onchurch-church.exception';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';

@Injectable()
export class OnchurchGetPublicChurchUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,
  ) {}

  async execute(slug: string): Promise<OnchurchChurch> {
    const church = await this.churchRepository.findPublishedBySlug(slug.trim());
    if (!church) throw new OnchurchChurchNotFound();
    return church;
  }

  // 공개 사이트용: 소유자가 테스트 계정인지 함께 돌려준다(웹이 테스트 교회에만 시험 기능을 노출하는 데 쓴다).
  // 소유자 조회가 실패해도 공개 페이지는 열려야 하므로 그때는 false 로 본다.
  async executeWithOwner(slug: string): Promise<{ church: OnchurchChurch; ownerIsTest: boolean }> {
    const church = await this.execute(slug);
    let ownerIsTest = false;
    try {
      ownerIsTest = !!(await this.userRepository.findOneOrThrowById(church.ownerId)).isTest;
    } catch {
      ownerIsTest = false;
    }
    return { church, ownerIsTest };
  }
}
