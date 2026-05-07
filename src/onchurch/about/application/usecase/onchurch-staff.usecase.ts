import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_STAFF_REPOSITORY, IOnchurchStaffRepository } from '@/onchurch/about/domain/repository/onchurch-staff.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchStaff } from '@/onchurch/about/domain/entity/onchurch-staff.entity';
import { OnchurchStaffWriteCommand } from '@/onchurch/about/application/command/onchurch-about-write.command';
import { OnchurchAboutChurchNotConfigured, OnchurchStaffNotFound } from '@/onchurch/about/domain/exception/onchurch-about.exception';

@Injectable()
export class OnchurchListMyStaffsUseCase {
  constructor(
    @Inject(ONCHURCH_STAFF_REPOSITORY) private readonly repo: IOnchurchStaffRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number): Promise<OnchurchStaff[]> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) return [];
    return this.repo.findAllByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchCreateMyStaffUseCase {
  constructor(
    @Inject(ONCHURCH_STAFF_REPOSITORY) private readonly repo: IOnchurchStaffRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, command: OnchurchStaffWriteCommand): Promise<OnchurchStaff> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    return this.repo.create(church.id, command);
  }
}

@Injectable()
export class OnchurchUpdateMyStaffUseCase {
  constructor(
    @Inject(ONCHURCH_STAFF_REPOSITORY) private readonly repo: IOnchurchStaffRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number, command: OnchurchStaffWriteCommand): Promise<OnchurchStaff> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchStaffNotFound();
    return this.repo.update(church.id, id, command);
  }
}

@Injectable()
export class OnchurchDeleteMyStaffUseCase {
  constructor(
    @Inject(ONCHURCH_STAFF_REPOSITORY) private readonly repo: IOnchurchStaffRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}
  async execute(userId: number, id: number): Promise<void> {
    const church = await this.churchRepo.findByOwnerId(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    const owned = await this.repo.findOwnedById(church.id, id);
    if (!owned) throw new OnchurchStaffNotFound();
    await this.repo.remove(church.id, id);
  }
}
