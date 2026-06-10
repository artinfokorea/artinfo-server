import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchUpsertMyChurchCommand } from '@/onchurch/church/application/command/onchurch-upsert-my-church.command';
import { OnchurchChurchSlugAlreadyTaken } from '@/onchurch/church/domain/exception/onchurch-church.exception';
import { OnchurchChurchRequiredService } from '@/onchurch/church/application/service/onchurch-church-required.service';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';

@Injectable()
export class OnchurchUpsertMyChurchUseCase {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    private readonly requiredService: OnchurchChurchRequiredService,

    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, command: OnchurchUpsertMyChurchCommand): Promise<OnchurchChurch> {
    // 관리자는 소유자(오너)의 교회를 수정한다. 관리 중인 교회가 없으면(=신규 사용자)
    // 본인을 오너로 하여 교회를 생성한다(기존 동작 유지).
    const managed = await this.managerResolver.resolveManagedChurch(userId);
    const ownerId = managed ? managed.ownerId : userId;

    // 서브도메인(slug)은 최초 1회만 발급되며 이후 변경 불가.
    // 이미 발급된 경우 클라이언트가 보낸 값과 무관하게 기존 slug를 유지한다.
    const existing = managed ?? (await this.churchRepository.findByOwnerId(ownerId));
    const slug = existing?.slug ?? command.slug;

    const slugOwner = await this.churchRepository.findBySlug(slug);
    if (slugOwner && slugOwner.ownerId !== ownerId) {
      throw new OnchurchChurchSlugAlreadyTaken();
    }

    const saved = await this.churchRepository.upsertByOwnerId(ownerId, {
      slug,
      name: command.name,
      eng: command.eng,
      tagline: command.tagline,
      phone: command.phone,
      email: command.email,
      address: command.address,
      representative: command.representative,
      businessNo: command.businessNo,
      logoUrl: command.logoUrl,
      youtubeUrl: command.youtubeUrl,
      enabledPages: command.enabledPages,
      homeSectionOrder: command.homeSectionOrder,
    });

    await this.requiredService.autoUnpublishIfMissing(saved);
    return await this.churchRepository.findByOwnerId(ownerId) ?? saved;
  }
}
