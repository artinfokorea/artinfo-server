import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_PASTOR_REPOSITORY, IOnchurchPastorRepository } from '@/onchurch/about/domain/repository/onchurch-pastor.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchPastor } from '@/onchurch/about/domain/entity/onchurch-pastor.entity';
import { OnchurchPastorWriteCommand } from '@/onchurch/about/application/command/onchurch-about-write.command';
import { OnchurchAboutChurchNotConfigured } from '@/onchurch/about/domain/exception/onchurch-about.exception';

@Injectable()
export class OnchurchScanMyPastorUseCase {
  constructor(
    @Inject(ONCHURCH_PASTOR_REPOSITORY)
    private readonly pastorRepository: IOnchurchPastorRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number): Promise<OnchurchPastor | null> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) return null;
    return this.pastorRepository.findByChurchId(church.id);
  }
}

@Injectable()
export class OnchurchUpsertMyPastorUseCase {
  constructor(
    @Inject(ONCHURCH_PASTOR_REPOSITORY)
    private readonly pastorRepository: IOnchurchPastorRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(userId: number, command: OnchurchPastorWriteCommand): Promise<OnchurchPastor> {
    const church = await this.churchRepository.findByOwnerId(userId);
    if (!church) throw new OnchurchAboutChurchNotConfigured();
    return this.pastorRepository.upsertByChurchId(church.id, command);
  }
}
