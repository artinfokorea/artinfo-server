import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzeyoCommunityPost } from '@/azeyo/community/domain/entity/azeyo-community-post.entity';
import { AzeyoCommunityVote } from '@/azeyo/community/domain/entity/azeyo-community-vote.entity';
import { AzeyoCommunityLike } from '@/azeyo/community/domain/entity/azeyo-community-like.entity';
import { AzeyoCommunityComment } from '@/azeyo/community/domain/entity/azeyo-community-comment.entity';
import { AzeyoCommunityController } from '@/azeyo/community/presentation/controller/azeyo-community.controller';
import { AZEYO_COMMUNITY_POST_REPOSITORY } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_VOTE_REPOSITORY } from '@/azeyo/community/domain/repository/azeyo-community-vote.repository.interface';
import { AZEYO_COMMUNITY_LIKE_REPOSITORY } from '@/azeyo/community/domain/repository/azeyo-community-like.repository.interface';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';
import { AzeyoCommunityPostRepository } from '@/azeyo/community/infrastructure/repository/azeyo-community-post.repository';
import { AzeyoCommunityVoteRepository } from '@/azeyo/community/infrastructure/repository/azeyo-community-vote.repository';
import { AzeyoCommunityLikeRepository } from '@/azeyo/community/infrastructure/repository/azeyo-community-like.repository';
import { AzeyoCommunityCommentRepository } from '@/azeyo/community/infrastructure/repository/azeyo-community-comment.repository';
import { AzeyoCreateCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-create-community-post.usecase';
import { AzeyoScanCommunityPostsUseCase } from '@/azeyo/community/application/usecase/azeyo-scan-community-posts.usecase';
import { AzeyoScanCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-scan-community-post.usecase';
import { AzeyoEditCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-edit-community-post.usecase';
import { AzeyoRemoveCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-remove-community-post.usecase';
import { AzeyoVoteCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-vote-community-post.usecase';
import { AzeyoLikeCommunityPostUseCase } from '@/azeyo/community/application/usecase/azeyo-like-community-post.usecase';
import { AzeyoUploadCommunityImagesUseCase } from '@/azeyo/community/application/usecase/azeyo-upload-community-images.usecase';
import { AzeyoCreateCommunityCommentUseCase } from '@/azeyo/community/application/usecase/azeyo-create-community-comment.usecase';
import { AzeyoScanCommunityCommentsUseCase } from '@/azeyo/community/application/usecase/azeyo-scan-community-comments.usecase';
import { AzeyoDeleteCommunityCommentUseCase } from '@/azeyo/community/application/usecase/azeyo-delete-community-comment.usecase';
import { AzeyoS3Service } from '@/azeyo/common/azeyo-s3.service';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AzeyoCommunityPost, AzeyoCommunityVote, AzeyoCommunityLike, AzeyoCommunityComment, AzeyoUser])],
  controllers: [AzeyoCommunityController],
  providers: [
    // UseCases
    AzeyoCreateCommunityPostUseCase,
    AzeyoScanCommunityPostsUseCase,
    AzeyoScanCommunityPostUseCase,
    AzeyoEditCommunityPostUseCase,
    AzeyoRemoveCommunityPostUseCase,
    AzeyoVoteCommunityPostUseCase,
    AzeyoLikeCommunityPostUseCase,
    AzeyoUploadCommunityImagesUseCase,
    AzeyoCreateCommunityCommentUseCase,
    AzeyoScanCommunityCommentsUseCase,
    AzeyoDeleteCommunityCommentUseCase,
    // Repositories
    { provide: AZEYO_COMMUNITY_POST_REPOSITORY, useClass: AzeyoCommunityPostRepository },
    { provide: AZEYO_COMMUNITY_VOTE_REPOSITORY, useClass: AzeyoCommunityVoteRepository },
    { provide: AZEYO_COMMUNITY_LIKE_REPOSITORY, useClass: AzeyoCommunityLikeRepository },
    { provide: AZEYO_COMMUNITY_COMMENT_REPOSITORY, useClass: AzeyoCommunityCommentRepository },
    // External
    AzeyoS3Service,
  ],
})
export class AzeyoCommunityModule {}
