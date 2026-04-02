import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';
import { AZEYO_USER_REPOSITORY } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AzeyoUserRepository } from '@/azeyo/user/infrastructure/repository/azeyo-user.repository';
import { AzeyoUserController } from '@/azeyo/user/presentation/controller/azeyo-user.controller';
import { AzeyoScanMyProfileUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-my-profile.usecase';
import { AzeyoEditProfileUseCase } from '@/azeyo/user/application/usecase/azeyo-edit-profile.usecase';
import { AzeyoScanTopMonthlyUsersUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-top-monthly-users.usecase';
import { AzeyoScanMyPostsUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-my-posts.usecase';
import { AzeyoCommunityModule } from '@/azeyo/community/azeyo-community.module';
import { AzeyoJokboModule } from '@/azeyo/jokbo/azeyo-jokbo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AzeyoUser]),
    AzeyoCommunityModule,
    AzeyoJokboModule,
  ],
  controllers: [AzeyoUserController],
  providers: [
    { provide: AZEYO_USER_REPOSITORY, useClass: AzeyoUserRepository },
    AzeyoScanMyProfileUseCase,
    AzeyoEditProfileUseCase,
    AzeyoScanTopMonthlyUsersUseCase,
    AzeyoScanMyPostsUseCase,
  ],
  exports: [AZEYO_USER_REPOSITORY],
})
export class AzeyoUserModule {}
