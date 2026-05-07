import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';

@Injectable()
export class OnchurchCheckSlugUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, slug: string): Promise<boolean> {
    const owner = await this.churchRepository.findBySlug(slug);
    if (!owner) return true;
    return owner.ownerId === userId;
  }
}
