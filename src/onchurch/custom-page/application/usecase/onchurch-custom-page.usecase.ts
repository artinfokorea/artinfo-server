import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_CUSTOM_PAGE_REPOSITORY,
  IOnchurchCustomPageRepository,
} from '@/onchurch/custom-page/domain/repository/onchurch-custom-page.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchCustomPage } from '@/onchurch/custom-page/domain/entity/onchurch-custom-page.entity';
import { OnchurchCustomPageWriteCommand } from '@/onchurch/custom-page/application/command/onchurch-custom-page-write.command';
import {
  OnchurchCustomPageChurchNotConfigured,
  OnchurchCustomPageNotFound,
  OnchurchCustomPageSlugDuplicated,
} from '@/onchurch/custom-page/domain/exception/onchurch-custom-page.exception';
import { normalizeCustomPageSlug } from '@/onchurch/custom-page/application/usecase/onchurch-custom-page-slug';

// 관리자용 — 내 교회 커스텀 페이지 관리. 모든 usecase가 managerResolver로 교회를 해석하므로
// 남의 교회 페이지에는 접근할 수 없다.
@Injectable()
export class OnchurchListMyCustomPagesUseCase {
  constructor(
    @Inject(ONCHURCH_CUSTOM_PAGE_REPOSITORY)
    private readonly pageRepository: IOnchurchCustomPageRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number): Promise<OnchurchCustomPage[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.pageRepository.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyCustomPageUseCase {
  constructor(
    @Inject(ONCHURCH_CUSTOM_PAGE_REPOSITORY)
    private readonly pageRepository: IOnchurchCustomPageRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, command: OnchurchCustomPageWriteCommand): Promise<OnchurchCustomPage> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchCustomPageChurchNotConfigured();
    const slug = normalizeCustomPageSlug(command.slug);
    if (await this.pageRepository.existsBySlug(church.id, slug)) throw new OnchurchCustomPageSlugDuplicated();
    return this.pageRepository.create(church.id, { ...command, slug });
  }
}

@Injectable()
export class OnchurchUpdateMyCustomPageUseCase {
  constructor(
    @Inject(ONCHURCH_CUSTOM_PAGE_REPOSITORY)
    private readonly pageRepository: IOnchurchCustomPageRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, id: number, command: OnchurchCustomPageWriteCommand): Promise<OnchurchCustomPage> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchCustomPageChurchNotConfigured();
    const slug = normalizeCustomPageSlug(command.slug);
    if (await this.pageRepository.existsBySlug(church.id, slug, id)) throw new OnchurchCustomPageSlugDuplicated();
    return this.pageRepository.update(church.id, id, { ...command, slug });
  }
}

// 사이드바의 페이지 ON/OFF 토글 — 본문은 그대로 두고 노출 여부만 바꾼다.
@Injectable()
export class OnchurchToggleMyCustomPageUseCase {
  constructor(
    @Inject(ONCHURCH_CUSTOM_PAGE_REPOSITORY)
    private readonly pageRepository: IOnchurchCustomPageRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, id: number, isActive: boolean): Promise<OnchurchCustomPage> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchCustomPageChurchNotConfigured();
    return this.pageRepository.updateActive(church.id, id, isActive);
  }
}

@Injectable()
export class OnchurchReorderMyCustomPagesUseCase {
  constructor(
    @Inject(ONCHURCH_CUSTOM_PAGE_REPOSITORY)
    private readonly pageRepository: IOnchurchCustomPageRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, orderedIds: number[]): Promise<OnchurchCustomPage[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchCustomPageChurchNotConfigured();
    await this.pageRepository.reorder(church.id, orderedIds);
    return this.pageRepository.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchDeleteMyCustomPageUseCase {
  constructor(
    @Inject(ONCHURCH_CUSTOM_PAGE_REPOSITORY)
    private readonly pageRepository: IOnchurchCustomPageRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchCustomPageChurchNotConfigured();
    await this.pageRepository.remove(church.id, id);
  }
}

// 공개 사이트용 — slug로 교회를 찾고 활성 페이지만 돌려준다.
@Injectable()
export class OnchurchListPublicCustomPagesUseCase {
  constructor(
    @Inject(ONCHURCH_CUSTOM_PAGE_REPOSITORY)
    private readonly pageRepository: IOnchurchCustomPageRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(churchSlug: string): Promise<OnchurchCustomPage[]> {
    const church = await this.churchRepository.findBySlug(churchSlug);
    if (!church) return [];
    return this.pageRepository.findActiveByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchGetPublicCustomPageUseCase {
  constructor(
    @Inject(ONCHURCH_CUSTOM_PAGE_REPOSITORY)
    private readonly pageRepository: IOnchurchCustomPageRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(churchSlug: string, pageSlug: string): Promise<OnchurchCustomPage> {
    const church = await this.churchRepository.findBySlug(churchSlug);
    if (!church) throw new OnchurchCustomPageNotFound();
    const page = await this.pageRepository.findActiveBySlug(church.id, (pageSlug ?? '').trim().toLowerCase());
    if (!page) throw new OnchurchCustomPageNotFound();
    return page;
  }
}
