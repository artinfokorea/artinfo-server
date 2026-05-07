import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchUpsertMyChurchCommand } from '@/onchurch/church/application/command/onchurch-upsert-my-church.command';
import { OnchurchChurchSlugAlreadyTaken } from '@/onchurch/church/domain/exception/onchurch-church.exception';

@Injectable()
export class OnchurchUpsertMyChurchUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, command: OnchurchUpsertMyChurchCommand): Promise<OnchurchChurch> {
    const slugOwner = await this.churchRepository.findBySlug(command.slug);
    if (slugOwner && slugOwner.ownerId !== userId) {
      throw new OnchurchChurchSlugAlreadyTaken();
    }

    return this.churchRepository.upsertByOwnerId(userId, {
      slug: command.slug,
      name: command.name,
      eng: command.eng,
      tagline: command.tagline,
      phone: command.phone,
      email: command.email,
      address: command.address,
      representative: command.representative,
      businessNo: command.businessNo,
      logoUrl: command.logoUrl,
      enabledPages: command.enabledPages,
    });
  }
}
