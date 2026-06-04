import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_COMMUNITY_POST_REPOSITORY,
  IOnchurchCommunityPostRepository,
} from '@/onchurch/community/domain/repository/onchurch-community-post.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchCommunityPostNotFound } from '@/onchurch/community/domain/exception/onchurch-community.exception';

@Injectable()
export class OnchurchReportPublicCommunityPostUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IOnchurchCommunityPostRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string, id: number): Promise<void> {
    const church = await this.churchRepository.findBySlug(slug);
    if (!church) throw new OnchurchCommunityPostNotFound();
    await this.postRepository.incrementReport(church.id, id);
  }
}
