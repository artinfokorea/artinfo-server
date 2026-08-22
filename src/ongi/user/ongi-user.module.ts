import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiUser } from '@/ongi/user/domain/entity/ongi-user.entity';
import { ONGI_USER_REPOSITORY } from '@/ongi/user/domain/repository/ongi-user.repository.interface';
import { OngiUserRepository } from '@/ongi/user/infrastructure/repository/ongi-user.repository';
import { OngiUserController } from '@/ongi/user/presentation/controller/ongi-user.controller';
import {
  OngiDeleteAccountUseCase,
  OngiGetMeUseCase,
  OngiGetMyStatsUseCase,
  OngiGetMyStorageUseCase,
  OngiUpdateMeUseCase,
  OngiUploadAvatarUseCase,
} from '@/ongi/user/application/usecase/ongi-user.usecase';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([OngiUser])],
  controllers: [OngiUserController],
  providers: [
    { provide: ONGI_USER_REPOSITORY, useClass: OngiUserRepository },
    OngiGetMeUseCase,
    OngiGetMyStatsUseCase,
    OngiGetMyStorageUseCase,
    OngiDeleteAccountUseCase,
    OngiUpdateMeUseCase,
    OngiUploadAvatarUseCase,
    AwsS3Service,
  ],
  exports: [ONGI_USER_REPOSITORY],
})
export class OngiUserModule {}
