import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_NOTICE_CATEGORY_REPOSITORY,
  IOnchurchNoticeCategoryRepository,
} from '@/onchurch/notice/domain/repository/onchurch-notice-category.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchNoticeCategory } from '@/onchurch/notice/domain/entity/onchurch-notice-category.entity';
import { OnchurchNoticeCategoryWriteCommand } from '@/onchurch/notice/application/command/onchurch-notice-category-write.command';
import { OnchurchNoticeChurchNotConfigured, OnchurchNoticeCategoryNotFound } from '@/onchurch/notice/domain/exception/onchurch-notice.exception';

@Injectable()
export class OnchurchListMyNoticeCategoriesUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_CATEGORY_REPOSITORY) private readonly repo: IOnchurchNoticeCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number): Promise<OnchurchNoticeCategory[]> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyNoticeCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_CATEGORY_REPOSITORY) private readonly repo: IOnchurchNoticeCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, command: OnchurchNoticeCategoryWriteCommand): Promise<OnchurchNoticeCategory> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchNoticeChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyNoticeCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_CATEGORY_REPOSITORY) private readonly repo: IOnchurchNoticeCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number, command: OnchurchNoticeCategoryWriteCommand): Promise<OnchurchNoticeCategory> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchNoticeChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchNoticeCategoryNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMyNoticeCategoryUseCase {
  constructor(
    @Inject(ONCHURCH_NOTICE_CATEGORY_REPOSITORY) private readonly repo: IOnchurchNoticeCategoryRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchNoticeChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchNoticeCategoryNotFound();
    await this.repo.remove(church.id, id);
  }
}
