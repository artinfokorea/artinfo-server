import { Inject, Injectable } from '@nestjs/common';
import { IOngiUserRepository, ONGI_USER_REPOSITORY, OngiProfileStats } from '@/ongi/user/domain/repository/ongi-user.repository.interface';
import { OngiUser } from '@/ongi/user/domain/entity/ongi-user.entity';

export interface OngiStorageInfo {
  usedGb: number;
  totalGb: number;
}

@Injectable()
export class OngiGetMeUseCase {
  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,
  ) {}

  async execute(userId: number): Promise<OngiUser> {
    return this.userRepository.findOneOrThrowById(userId);
  }
}

@Injectable()
export class OngiGetMyStatsUseCase {
  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,
  ) {}

  async execute(userId: number): Promise<OngiProfileStats> {
    return this.userRepository.getProfileStats(userId);
  }
}

@Injectable()
export class OngiGetMyStorageUseCase {
  /** 사진 원본을 아직 자체 스토리지에 보관하지 않으므로 사진 1장당 5MB로 추정 계산 */
  private ESTIMATED_MB_PER_PHOTO = 5;
  private TOTAL_GB = 15;

  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,
  ) {}

  async execute(userId: number): Promise<OngiStorageInfo> {
    const stats = await this.userRepository.getProfileStats(userId);
    const usedGb = Math.round((stats.photoCount * this.ESTIMATED_MB_PER_PHOTO * 10) / 1024) / 10;

    return { usedGb, totalGb: this.TOTAL_GB };
  }
}

@Injectable()
export class OngiDeleteAccountUseCase {
  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,
  ) {}

  async execute(userId: number): Promise<void> {
    await this.userRepository.findOneOrThrowById(userId);
    await this.userRepository.softDeleteById(userId);
  }
}
