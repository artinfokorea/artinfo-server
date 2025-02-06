import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LikeEntity } from '@/like/LikeEntity';

@Injectable()
export class LikeRepository extends Repository<LikeEntity> {
  constructor(dataSource: DataSource) {
    super(LikeEntity, dataSource.createEntityManager());
  }
}
