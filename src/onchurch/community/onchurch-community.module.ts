import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchCommunityPost } from '@/onchurch/community/domain/entity/onchurch-community-post.entity';
import { OnchurchCommunityCategory } from '@/onchurch/community/domain/entity/onchurch-community-category.entity';
import { ONCHURCH_COMMUNITY_POST_REPOSITORY } from '@/onchurch/community/domain/repository/onchurch-community-post.repository.interface';
import { ONCHURCH_COMMUNITY_CATEGORY_REPOSITORY } from '@/onchurch/community/domain/repository/onchurch-community-category.repository.interface';
import { OnchurchCommunityPostRepository } from '@/onchurch/community/infrastructure/repository/onchurch-community-post.repository';
import { OnchurchCommunityCategoryRepository } from '@/onchurch/community/infrastructure/repository/onchurch-community-category.repository';
import { OnchurchCommunityController } from '@/onchurch/community/presentation/controller/onchurch-community.controller';
import { OnchurchPublicCommunityController } from '@/onchurch/community/presentation/controller/onchurch-public-community.controller';
import { OnchurchCommunityCategoryController } from '@/onchurch/community/presentation/controller/onchurch-community-category.controller';
import { OnchurchCommunityChurchResolver } from '@/onchurch/community/application/usecase/onchurch-community-post-church-resolver.service';
import { OnchurchCreateMyCommunityPostUseCase } from '@/onchurch/community/application/usecase/onchurch-create-my-community-post.usecase';
import { OnchurchUpdateMyCommunityPostUseCase } from '@/onchurch/community/application/usecase/onchurch-update-my-community-post.usecase';
import { OnchurchDeleteMyCommunityPostUseCase } from '@/onchurch/community/application/usecase/onchurch-delete-my-community-post.usecase';
import { OnchurchListPublicCommunityPostsUseCase } from '@/onchurch/community/application/usecase/onchurch-list-public-community-posts.usecase';
import { OnchurchGetPublicCommunityPostUseCase } from '@/onchurch/community/application/usecase/onchurch-get-public-community-post.usecase';
import { OnchurchReportPublicCommunityPostUseCase } from '@/onchurch/community/application/usecase/onchurch-report-public-community-post.usecase';
import {
  OnchurchListManageCommunityPostsUseCase,
  OnchurchSetHiddenCommunityPostUseCase,
  OnchurchDeleteManageCommunityPostUseCase,
} from '@/onchurch/community/application/usecase/onchurch-manage-community-posts.usecase';
import {
  OnchurchListMyCommunityCategoriesUseCase,
  OnchurchListPublicCommunityCategoriesUseCase,
  OnchurchCreateMyCommunityCategoryUseCase,
  OnchurchUpdateMyCommunityCategoryUseCase,
  OnchurchDeleteMyCommunityCategoryUseCase,
} from '@/onchurch/community/application/usecase/onchurch-community-category.usecase';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnchurchCommunityPost, OnchurchCommunityCategory]),
    OnchurchChurchModule,
    OnchurchUserModule,
  ],
  controllers: [OnchurchCommunityController, OnchurchPublicCommunityController, OnchurchCommunityCategoryController],
  providers: [
    { provide: ONCHURCH_COMMUNITY_POST_REPOSITORY, useClass: OnchurchCommunityPostRepository },
    { provide: ONCHURCH_COMMUNITY_CATEGORY_REPOSITORY, useClass: OnchurchCommunityCategoryRepository },
    OnchurchCommunityChurchResolver,
    OnchurchCreateMyCommunityPostUseCase,
    OnchurchUpdateMyCommunityPostUseCase,
    OnchurchDeleteMyCommunityPostUseCase,
    OnchurchListPublicCommunityPostsUseCase,
    OnchurchGetPublicCommunityPostUseCase,
    OnchurchReportPublicCommunityPostUseCase,
    OnchurchListManageCommunityPostsUseCase,
    OnchurchSetHiddenCommunityPostUseCase,
    OnchurchDeleteManageCommunityPostUseCase,
    OnchurchListMyCommunityCategoriesUseCase,
    OnchurchListPublicCommunityCategoriesUseCase,
    OnchurchCreateMyCommunityCategoryUseCase,
    OnchurchUpdateMyCommunityCategoryUseCase,
    OnchurchDeleteMyCommunityCategoryUseCase,
  ],
})
export class OnchurchCommunityModule {}
