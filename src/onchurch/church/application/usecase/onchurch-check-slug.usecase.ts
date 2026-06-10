import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';

@Injectable()
export class OnchurchCheckSlugUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, slug: string): Promise<boolean> {
    const owner = await this.churchRepository.findBySlug(slug);
    if (!owner) return true;
    if (owner.ownerId === userId) return true;
    // 관리자가 자신이 관리하는 교회의 slug 를 확인하는 경우도 사용 가능 처리.
    const managed = await this.managerResolver.resolveManagedChurch(userId);
    return !!managed && managed.id === owner.id;
  }
}
