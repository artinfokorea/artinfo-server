import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LessonApplicationEntity } from '@/lesson/entity/lesson-application.entity';

@Injectable()
export class LessonApplicationRepository extends Repository<LessonApplicationEntity> {
  constructor(dataSource: DataSource) {
    super(LessonApplicationEntity, dataSource.createEntityManager());
  }
}
