import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_SERMON_REPOSITORY,
  IOnchurchSermonRepository,
} from '@/onchurch/sermon/domain/repository/onchurch-sermon.repository.interface';
import {
  ONCHURCH_SERMON_SERIES_REPOSITORY,
  IOnchurchSermonSeriesRepository,
} from '@/onchurch/sermon/domain/repository/onchurch-sermon-series.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchSermon } from '@/onchurch/sermon/domain/entity/onchurch-sermon.entity';
import { OnchurchSermonSeries } from '@/onchurch/sermon/domain/entity/onchurch-sermon-series.entity';

export interface PublicSermonView {
  series: OnchurchSermonSeries[];
  sermons: OnchurchSermon[];
}

@Injectable()
export class OnchurchListPublicSermonsUseCase {
  constructor(
    @Inject(ONCHURCH_SERMON_REPOSITORY) private readonly sermonRepo: IOnchurchSermonRepository,
    @Inject(ONCHURCH_SERMON_SERIES_REPOSITORY) private readonly seriesRepo: IOnchurchSermonSeriesRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepo: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string): Promise<PublicSermonView> {
    const church = await this.churchRepo.findBySlug(slug);
    if (!church) return { series: [], sermons: [] };
    const [series, sermons] = await Promise.all([
      this.seriesRepo.findActiveByChurchId(church.id),
      this.sermonRepo.findActiveByChurchId(church.id),
    ]);
    return { series, sermons };
  }
}
