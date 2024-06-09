import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { School } from '@/user/entity/school.entity';
import { SchoolCreator } from '@/user/repository/opertaion/school.creator';

@Injectable()
export class SchoolRepository {
  async createMany(creators: SchoolCreator[], transactionManager: EntityManager): Promise<number[]> {
    const schools = await transactionManager.save(School, creators);

    return schools.map(school => school.id);
  }
}
