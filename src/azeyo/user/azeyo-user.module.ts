import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';
import { AZEYO_USER_REPOSITORY } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AzeyoUserRepository } from '@/azeyo/user/infrastructure/repository/azeyo-user.repository';
import { AzeyoUserController } from '@/azeyo/user/presentation/controller/azeyo-user.controller';
import { AzeyoScanMyProfileUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-my-profile.usecase';
import { AzeyoEditProfileUseCase } from '@/azeyo/user/application/usecase/azeyo-edit-profile.usecase';
import { AzeyoScanTopMonthlyUsersUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-top-monthly-users.usecase';
import { AzeyoScanMyPostsUseCase } from '@/azeyo/user/application/usecase/azeyo-scan-my-posts.usecase';
import { AzeyoUploadProfileImageUseCase } from '@/azeyo/user/application/usecase/azeyo-upload-profile-image.usecase';
import { AzeyoS3Service } from '@/azeyo/common/azeyo-s3.service';
import { AzeyoCommunityModule } from '@/azeyo/community/azeyo-community.module';
import { AzeyoJokboModule } from '@/azeyo/jokbo/azeyo-jokbo.module';
import { AZEYO_ACTIVITY_POINTS_SERVICE } from '@/azeyo/user/domain/service/azeyo-activity-points.service';
import { AzeyoActivityPointsService } from '@/azeyo/user/infrastructure/service/azeyo-activity-points.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AzeyoUser]),
    forwardRef(() => AzeyoCommunityModule),
    forwardRef(() => AzeyoJokboModule),
  ],
  controllers: [AzeyoUserController],
  providers: [
    { provide: AZEYO_USER_REPOSITORY, useClass: AzeyoUserRepository },
    { provide: AZEYO_ACTIVITY_POINTS_SERVICE, useClass: AzeyoActivityPointsService },
    AzeyoScanMyProfileUseCase,
    AzeyoEditProfileUseCase,
    AzeyoScanTopMonthlyUsersUseCase,
    AzeyoScanMyPostsUseCase,
    AzeyoUploadProfileImageUseCase,
    AzeyoS3Service,
  ],
  exports: [AZEYO_USER_REPOSITORY, AZEYO_ACTIVITY_POINTS_SERVICE],
})
export class AzeyoUserModule {}
