import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchChurchNotFound } from '@/onchurch/church/domain/exception/onchurch-church.exception';

@Injectable()
export class OnchurchGetPublicChurchUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string): Promise<OnchurchChurch> {
    const church = await this.churchRepository.findPublishedBySlug(slug.trim());
    if (!church) throw new OnchurchChurchNotFound();
    return church;
  }
}
