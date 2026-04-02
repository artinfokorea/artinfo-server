import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';
import { IAzeyoActivityPointsService, AZEYO_ACTIVITY_ACTION } from '@/azeyo/user/domain/service/azeyo-activity-points.service';

const POINTS_MAP: Record<AZEYO_ACTIVITY_ACTION, number> = {
  [AZEYO_ACTIVITY_ACTION.CREATE_POST]: 10,
  [AZEYO_ACTIVITY_ACTION.CREATE_COMMENT]: 3,
  [AZEYO_ACTIVITY_ACTION.CREATE_JOKBO]: 15,
  [AZEYO_ACTIVITY_ACTION.JOKBO_COPIED]: 5,
  [AZEYO_ACTIVITY_ACTION.RECEIVE_LIKE]: 2,
  [AZEYO_ACTIVITY_ACTION.GIVE_LIKE]: 1,
  [AZEYO_ACTIVITY_ACTION.VOTE]: 2,
  [AZEYO_ACTIVITY_ACTION.CREATE_SCHEDULE]: 3,
};

@Injectable()
export class AzeyoActivityPointsService implements IAzeyoActivityPointsService {
  constructor(
    @InjectRepository(AzeyoUser)
    private readonly userRepository: Repository<AzeyoUser>,
  ) {}

  async addPoints(userId: number, action: AZEYO_ACTIVITY_ACTION): Promise<void> {
    const points = POINTS_MAP[action];
    await this.userRepository.increment({ id: userId }, 'activityPoints', points);
    await this.userRepository.increment({ id: userId }, 'monthlyPoints', points);
  }
}
