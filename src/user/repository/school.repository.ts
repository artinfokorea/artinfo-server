import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { School } from '@/user/entity/school.entity';
import { SchoolCreator } from '@/user/repository/opertaion/school.creator';

@Injectable()
export class SchoolRepository {
  async deleteByUserId(userId: number, transactionManager: EntityManager): Promise<void> {
    await transactionManager.delete(School, { user: { id: userId } });
  }

  async createMany(creators: SchoolCreator[], transactionManager: EntityManager): Promise<number[]> {
    const schools = await transactionManager.save(
      School,
      creators.map(creator => {
        return {
          user: { id: creator.userId },
          name: creator.name,
          type: creator.type,
        };
      }),
    );

    return schools.map(school => school.id);
  }
}
