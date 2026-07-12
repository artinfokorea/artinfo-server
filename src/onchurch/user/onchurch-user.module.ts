import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchUser } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { ONCHURCH_USER_REPOSITORY } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchUserRepository } from '@/onchurch/user/infrastructure/repository/onchurch-user.repository';
import { OnchurchUserController } from '@/onchurch/user/presentation/controller/onchurch-user.controller';
import {
  OnchurchGetMyProfileUseCase,
  OnchurchUpdateMyProfileUseCase,
  OnchurchChangeMyPasswordUseCase,
  OnchurchSetInitialPasswordUseCase,
} from '@/onchurch/user/application/usecase/onchurch-user-profile.usecase';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Module({
  imports: [TypeOrmModule.forFeature([OnchurchUser])],
  controllers: [OnchurchUserController],
  providers: [
    { provide: ONCHURCH_USER_REPOSITORY, useClass: OnchurchUserRepository },
    OnchurchGetMyProfileUseCase,
    OnchurchUpdateMyProfileUseCase,
    OnchurchChangeMyPasswordUseCase,
    OnchurchSetInitialPasswordUseCase,
    RedisRepository,
  ],
  exports: [ONCHURCH_USER_REPOSITORY],
})
export class OnchurchUserModule {}
