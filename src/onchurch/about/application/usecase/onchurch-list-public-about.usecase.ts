import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_PASTOR_REPOSITORY, IOnchurchPastorRepository } from '@/onchurch/about/domain/repository/onchurch-pastor.repository.interface';
import { ONCHURCH_VISION_REPOSITORY, IOnchurchVisionRepository } from '@/onchurch/about/domain/repository/onchurch-vision.repository.interface';
import { ONCHURCH_HISTORY_REPOSITORY, IOnchurchHistoryRepository } from '@/onchurch/about/domain/repository/onchurch-history.repository.interface';
import { ONCHURCH_STAFF_REPOSITORY, IOnchurchStaffRepository } from '@/onchurch/about/domain/repository/onchurch-staff.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchPastor } from '@/onchurch/about/domain/entity/onchurch-pastor.entity';
import { OnchurchVision } from '@/onchurch/about/domain/entity/onchurch-vision.entity';
import { OnchurchHistory } from '@/onchurch/about/domain/entity/onchurch-history.entity';
import { OnchurchStaff } from '@/onchurch/about/domain/entity/onchurch-staff.entity';

export interface PublicAboutView {
  pastor: OnchurchPastor | null;
  visions: OnchurchVision[];
  histories: OnchurchHistory[];
  staffs: OnchurchStaff[];
}

@Injectable()
export class OnchurchListPublicAboutUseCase {
  constructor(
    @Inject(ONCHURCH_PASTOR_REPOSITORY) private readonly pastorRepo: IOnchurchPastorRepository,
    @Inject(ONCHURCH_VISION_REPOSITORY) private readonly visionRepo: IOnchurchVisionRepository,
    @Inject(ONCHURCH_HISTORY_REPOSITORY) private readonly historyRepo: IOnchurchHistoryRepository,
    @Inject(ONCHURCH_STAFF_REPOSITORY) private readonly staffRepo: IOnchurchStaffRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string): Promise<PublicAboutView> {
    const church = await this.churchRepo.findBySlug(slug);
    if (!church) {
      return { pastor: null, visions: [], histories: [], staffs: [] };
    }
    const [pastor, visions, histories, staffs] = await Promise.all([
      this.pastorRepo.findByChurchId(church.id),
      this.visionRepo.findAllByChurchId(church.id),
      this.historyRepo.findAllByChurchId(church.id),
      this.staffRepo.findAllByChurchId(church.id),
    ]);
    return { pastor, visions, histories, staffs };
  }
}
