import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_GALLERY_REPOSITORY,
  IOnchurchGalleryRepository,
} from '@/onchurch/gallery/domain/repository/onchurch-gallery.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
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
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number): Promise<OnchurchGallery[]> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyGalleryUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_REPOSITORY) private readonly repo: IOnchurchGalleryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, command: OnchurchGalleryWriteCommand): Promise<OnchurchGallery> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchGalleryChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyGalleryUseCase {
  constructor(
    @Inject(ONCHURCH_GALLERY_REPOSITORY) private readonly repo: IOnchurchGalleryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number, command: OnchurchGalleryWriteCommand): Promise<OnchurchGallery> {
    const church = await this.churchRepo.findByOwnerId(userId);
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
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchGalleryChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchGalleryNotFound();
    await this.repo.remove(church.id, id);
  }
}
