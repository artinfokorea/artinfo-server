import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { ONCHURCH_USER_REPOSITORY } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchUserRepository } from '@/onchurch/user/infrastructure/repository/onchurch-user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchUser])],
  providers: [{ provide: ONCHURCH_USER_REPOSITORY, useClass: OnchurchUserRepository }],
  exports: [ONCHURCH_USER_REPOSITORY],
})
export class OnchurchUserModule {}
