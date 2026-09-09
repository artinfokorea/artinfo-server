import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalpyeoUser } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { SALPYEO_USER_REPOSITORY } from '@/salpyeo/user/domain/repository/salpyeo-user.repository.interface';
import { SalpyeoUserRepository } from '@/salpyeo/user/infrastructure/repository/salpyeo-user.repository';
import { SalpyeoUserMemoryRepository } from '@/salpyeo/user/infrastructure/repository/salpyeo-user.memory.repository';
import { SalpyeoGetMeUseCase } from '@/salpyeo/user/application/usecase/salpyeo-get-me.usecase';
import { SalpyeoUserController } from '@/salpyeo/user/presentation/controller/salpyeo-user.controller';
import { isSalpyeoMemoryRepository } from '@/salpyeo/common/salpyeo-repository-mode';

@Module({
  imports: isSalpyeoMemoryRepository() ? [] : [TypeOrmModule.forFeature([SalpyeoUser])],
  controllers: [SalpyeoUserController],
  providers: [
    SalpyeoGetMeUseCase,
    isSalpyeoMemoryRepository()
      ? { provide: SALPYEO_USER_REPOSITORY, useValue: new SalpyeoUserMemoryRepository() }
      : { provide: SALPYEO_USER_REPOSITORY, useClass: SalpyeoUserRepository },
  ],
  exports: [SALPYEO_USER_REPOSITORY],
})
export class SalpyeoUserModule {}
