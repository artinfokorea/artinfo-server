import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_COMMUNITY_COMMENT_REPOSITORY,
  IOnchurchCommunityCommentRepository,
} from '@/onchurch/community/domain/repository/onchurch-community-comment.repository.interface';
import {
  ONCHURCH_COMMUNITY_POST_REPOSITORY,
  IOnchurchCommunityPostRepository,
} from '@/onchurch/community/domain/repository/onchurch-community-post.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchCommunityChurchResolver } from '@/onchurch/community/application/usecase/onchurch-community-post-church-resolver.service';
import { OnchurchCommunityComment } from '@/onchurch/community/domain/entity/onchurch-community-comment.entity';
import {
  OnchurchCommunityCommentForbidden,
  OnchurchCommunityCommentNotFound,
  OnchurchCommunityPostNotFound,
} from '@/onchurch/community/domain/exception/onchurch-community.exception';

// 공개 — 게시글의 댓글 목록(오래된 순). 숨김/삭제된 게시글의 댓글은 내려주지 않는다.
@Injectable()
export class OnchurchListPublicCommunityCommentsUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_COMMENT_REPOSITORY) private readonly commentRepository: IOnchurchCommunityCommentRepository,
    @Inject(ONCHURCH_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IOnchurchCommunityPostRepository,
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepository: IOnchurchChurchRepository,
  ) {}

  async execute(slug: string, postId: number): Promise<OnchurchCommunityComment[]> {
    const church = await this.churchRepository.findBySlug(slug);
    if (!church) throw new OnchurchCommunityPostNotFound();
    const post = await this.postRepository.findVisibleById(church.id, postId);
    if (!post) throw new OnchurchCommunityPostNotFound();
    return this.commentRepository.findByPostId(church.id, postId);
  }
}

// 성도 — 소속 교회의 공개 게시글에만 댓글을 단다.
@Injectable()
export class OnchurchCreateMyCommunityCommentUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_COMMENT_REPOSITORY) private readonly commentRepository: IOnchurchCommunityCommentRepository,
    @Inject(ONCHURCH_COMMUNITY_POST_REPOSITORY) private readonly postRepository: IOnchurchCommunityPostRepository,
    private readonly resolver: OnchurchCommunityChurchResolver,
  ) {}

  async execute(userId: number, postId: number, content: string): Promise<OnchurchCommunityComment> {
    const { user, churchId } = await this.resolver.resolve(userId);
    const post = await this.postRepository.findVisibleById(churchId, postId);
    if (!post) throw new OnchurchCommunityPostNotFound();
    return this.commentRepository.create({ churchId, postId, authorId: user.id, authorName: user.name, content });
  }
}

// 삭제 — 본인 댓글이거나, 그 교회의 관리자(오너/관리자)면 가능.
@Injectable()
export class OnchurchDeleteMyCommunityCommentUseCase {
  constructor(
    @Inject(ONCHURCH_COMMUNITY_COMMENT_REPOSITORY) private readonly commentRepository: IOnchurchCommunityCommentRepository,
    private readonly resolver: OnchurchCommunityChurchResolver,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}

  async execute(userId: number, id: number): Promise<void> {
    const { user, churchId } = await this.resolver.resolve(userId);
    const comment = await this.commentRepository.findById(churchId, id);
    if (!comment) throw new OnchurchCommunityCommentNotFound();
    if (comment.authorId !== user.id) {
      const managed = await this.managerResolver.resolveManagedChurch(userId);
      if (!managed || managed.id !== churchId) throw new OnchurchCommunityCommentForbidden();
    }
    await this.commentRepository.remove(comment);
  }
}
