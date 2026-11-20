import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchCommunityBlockRepository, OnchurchCommunityBlockRow } from '@/onchurch/community-block/onchurch-community-block.repository';

export class OnchurchCommunityCannotBlockSelf extends HttpException {
  constructor() {
    super({ code: 'ONCHURCH-COMMUNITY-BLOCK-001', message: '자기 자신은 차단할 수 없습니다.' }, HttpStatus.BAD_REQUEST);
  }
}

@Injectable()
export class OnchurchCommunityBlockService {
  constructor(
    private readonly blockRepository: OnchurchCommunityBlockRepository,
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
  ) {}

  list(userId: number): Promise<OnchurchCommunityBlockRow[]> {
    return this.blockRepository.findByUserId(userId);
  }

  async block(userId: number, targetUserId: number): Promise<void> {
    if (userId === targetUserId) throw new OnchurchCommunityCannotBlockSelf();
    // 없는 사용자면 여기서 404
    await this.userRepository.findOneOrThrowById(targetUserId);
    await this.blockRepository.add(userId, targetUserId);
  }

  unblock(userId: number, targetUserId: number): Promise<void> {
    return this.blockRepository.remove(userId, targetUserId);
  }
}
