import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';
import { AZEYO_USER_REPOSITORY } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AzeyoUserRepository } from '@/azeyo/user/infrastructure/repository/azeyo-user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AzeyoUser])],
  providers: [{ provide: AZEYO_USER_REPOSITORY, useClass: AzeyoUserRepository }],
  exports: [AZEYO_USER_REPOSITORY],
})
export class AzeyoUserModule {}
