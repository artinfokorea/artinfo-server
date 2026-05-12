import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchUpsertMyChurchCommand } from '@/onchurch/church/application/command/onchurch-upsert-my-church.command';
import { OnchurchChurchSlugAlreadyTaken } from '@/onchurch/church/domain/exception/onchurch-church.exception';
import { OnchurchChurchRequiredService } from '@/onchurch/church/application/service/onchurch-church-required.service';

@Injectable()
export class OnchurchUpsertMyChurchUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    private readonly requiredService: OnchurchChurchRequiredService,
  ) {}

  async execute(userId: number, command: OnchurchUpsertMyChurchCommand): Promise<OnchurchChurch> {
    const slugOwner = await this.churchRepository.findBySlug(command.slug);
    if (slugOwner && slugOwner.ownerId !== userId) {
      throw new OnchurchChurchSlugAlreadyTaken();
    }

    const saved = await this.churchRepository.upsertByOwnerId(userId, {
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

    await this.requiredService.autoUnpublishIfMissing(saved);
    return await this.churchRepository.findByOwnerId(userId) ?? saved;
  }
}
