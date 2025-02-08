import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { LikeEntity } from '@/like/LikeEntity';

@Injectable()
export class LikeRepository extends Repository<LikeEntity> {
  constructor(dataSource: DataSource) {
    super(LikeEntity, dataSource.createEntityManager());
  }

  async findManyInTargetIdsAndUserId(targetIds: number[], userId: number) {
    return this.findBy({ targetId: In(targetIds), userId: userId });
  }
}
