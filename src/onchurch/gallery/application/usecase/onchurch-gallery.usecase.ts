import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_GALLERY_REPOSITORY,
  IOnchurchGalleryRepository,
} from '@/onchurch/gallery/domain/repository/onchurch-gallery.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchGallery } from '@/onchurch/gallery/domain/entity/onchurch-gallery.entity';
import { OnchurchGalleryWriteCommand } from '@/onchurch/gallery/application/command/onchurch-gallery-write.command';
import {
  OnchurchGalleryChurchNotConfigured,
  OnchurchGalleryNotFound,
} from '@/onchurch/gallery/domain/exception/onchurch-gallery.exception';

@Injectable()
export class OnchurchListMyGalleriesUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_REPOSITORY) private readonly repo: IOnchurchGalleryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number): Promise<OnchurchGallery[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyGalleryUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_REPOSITORY) private readonly repo: IOnchurchGalleryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, command: OnchurchGalleryWriteCommand): Promise<OnchurchGallery> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchGalleryChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyGalleryUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_REPOSITORY) private readonly repo: IOnchurchGalleryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number, command: OnchurchGalleryWriteCommand): Promise<OnchurchGallery> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchGalleryChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchGalleryNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMyGalleryUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_REPOSITORY) private readonly repo: IOnchurchGalleryRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchGalleryChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchGalleryNotFound();
    await this.repo.remove(church.id, id);
  }
}
