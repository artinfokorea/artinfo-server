import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOngiBlockRepository } from '@/ongi/group/domain/repository/ongi-block.repository.interface';
import { OngiBlock } from '@/ongi/group/domain/entity/ongi-block.entity';

@Injectable()
export class OngiBlockRepository implements IOngiBlockRepository {
  constructor(
    @InjectRepository(OngiBlock)
    private readonly blockRepository: Repository<OngiBlock>,
  ) {}

  async blockedUserIdsOf(userId: number): Promise<number[]> {
    const blocks = await this.blockRepository.find({ where: { userId } });

    return blocks.map(block => block.blockedUserId);
  }

  async block(userId: number, blockedUserId: number): Promise<void> {
    // 유니크 인덱스가 있으므로 동시 요청에도 중복이 생기지 않는다
    await this.blockRepository.createQueryBuilder().insert().into(OngiBlock).values({ userId, blockedUserId }).orIgnore().execute();
  }

  async unblock(userId: number, blockedUserId: number): Promise<void> {
    await this.blockRepository.delete({ userId, blockedUserId });
  }
}
