import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_GALLERY_CATEGORY_REPOSITORY,
  IOnchurchGalleryCategoryRepository,
} from '@/onchurch/gallery/domain/repository/onchurch-gallery-category.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchGalleryCategory } from '@/onchurch/gallery/domain/entity/onchurch-gallery-category.entity';
import { OnchurchGalleryCategoryWriteCommand } from '@/onchurch/gallery/application/command/onchurch-gallery-write.command';
import {
  OnchurchGalleryChurchNotConfigured,
  OnchurchGalleryCategoryNotFound,
} from '@/onchurch/gallery/domain/exception/onchurch-gallery.exception';

@Injectable()
export class OnchurchListMyGalleryCategoriesUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_CATEGORY_REPOSITORY) private readonly repo: IOnchurchGalleryCategoryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchGalleryCategory[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyGalleryCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_CATEGORY_REPOSITORY) private readonly repo: IOnchurchGalleryCategoryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchGalleryCategoryWriteCommand): Promise<OnchurchGalleryCategory> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchGalleryChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyGalleryCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_CATEGORY_REPOSITORY) private readonly repo: IOnchurchGalleryCategoryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, command: OnchurchGalleryCategoryWriteCommand): Promise<OnchurchGalleryCategory> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchGalleryChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchGalleryCategoryNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMyGalleryCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_CATEGORY_REPOSITORY) private readonly repo: IOnchurchGalleryCategoryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchGalleryChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchGalleryCategoryNotFound();
    await this.repo.remove(church.id, id);
  }
}
