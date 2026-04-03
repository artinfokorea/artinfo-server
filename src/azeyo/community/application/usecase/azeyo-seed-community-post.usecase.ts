import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzeyoCommunityGptService } from '@/azeyo/community/infrastructure/gpt/azeyo-community-gpt.service';
import { AZEYO_COMMUNITY_POST_REPOSITORY, IAzeyoCommunityPostRepository } from '@/azeyo/community/domain/repository/azeyo-community-post.repository.interface';
import { AZEYO_COMMUNITY_COMMENT_REPOSITORY, IAzeyoCommunityCommentRepository } from '@/azeyo/community/domain/repository/azeyo-community-comment.repository.interface';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

@Injectable()
export class AzeyoSeedCommunityPostUseCase {
  private readonly logger = new Logger(AzeyoSeedCommunityPostUseCase.name);

  constructor(
    private readonly gptService: AzeyoCommunityGptService,
    @Inject(AZEYO_COMMUNITY_POST_REPOSITORY)
    private readonly postRepository: IAzeyoCommunityPostRepository,
    @Inject(AZEYO_COMMUNITY_COMMENT_REPOSITORY)
    private readonly commentRepository: IAzeyoCommunityCommentRepository,
    @InjectRepository(AzeyoUser)
    private readonly userRepository: Repository<AzeyoUser>,
  ) {}

  async execute(): Promise<{ postId: number; commentCount: number }> {
    const now = new Date();

    // 1. 시드 유저 목록 조회 (seed 이메일 패턴)
    const seedUsers = await this.userRepository
      .createQueryBuilder('u')
      .where("u.email LIKE 'seed%@azeyo.co.kr'")
      .getMany();

    if (seedUsers.length === 0) {
      throw new Error('시드 유저가 없습니다');
    }

    // 2. 최신 글 조회하여 시간 범위 + 제외 카테고리 결정
    const latestPost = await this.getLatestPost();
    const baseTime = latestPost ? new Date(latestPost.createdAt) : new Date(now.getTime() - 3600 * 1000);
    const excludeCategory = latestPost?.category || null;

    // baseTime이 now보다 미래이면 보정
    const effectiveBaseTime = baseTime.getTime() > now.getTime()
      ? new Date(now.getTime() - 60 * 1000)
      : baseTime;

    // 3. 글 작성 시간: baseTime ~ now 사이 랜덤
    const postTime = this.randomDateBetween(effectiveBaseTime, now);

    // 4. 댓글 수 랜덤 (0~5)
    const commentCount = Math.floor(Math.random() * 6);

    // 5. GPT로 글/댓글 생성 (최신 글 카테고리 제외)
    const generated = await this.gptService.generatePost(commentCount, excludeCategory);

    // 6. 랜덤 유저 선택 (글 작성자)
    const postAuthor = this.pickRandom(seedUsers);

    // 7. 글 저장 (createdAt 직접 지정)
    const post = await this.postRepository.create({
      userId: postAuthor.id,
      type: generated.type,
      category: generated.category,
      title: generated.title,
      contents: generated.contents,
      imageUrls: null,
      imageRatio: null,
      voteOptionA: generated.voteOptionA,
      voteOptionB: generated.voteOptionB,
    });

    // createdAt을 직접 업데이트 (TypeORM의 @CreateDateColumn 우회)
    await this.userRepository.manager.query(
      `UPDATE azeyo_community_posts SET created_at = $1, updated_at = $1 WHERE id = $2`,
      [postTime, post.id],
    );

    this.logger.log(`글 생성 완료: id=${post.id}, author=${postAuthor.nickname}, time=${postTime.toISOString()}`);

    // 8. 댓글 저장
    const usedUserIds = new Set<number>([postAuthor.id]);
    for (let i = 0; i < generated.comments.length; i++) {
      // 댓글 시간: postTime ~ now 사이 랜덤
      const commentTime = this.randomDateBetween(postTime, now);

      // 댓글 작성자: 글 작성자와 다른 유저 (가능하면)
      const availableUsers = seedUsers.filter(u => !usedUserIds.has(u.id));
      const commentAuthor = availableUsers.length > 0
        ? this.pickRandom(availableUsers)
        : this.pickRandom(seedUsers);
      usedUserIds.add(commentAuthor.id);

      const comment = await this.commentRepository.create({
        postId: post.id,
        userId: commentAuthor.id,
        parentId: null,
        contents: generated.comments[i],
      });

      await this.userRepository.manager.query(
        `UPDATE azeyo_community_comments SET created_at = $1, updated_at = $1 WHERE id = $2`,
        [commentTime, comment.id],
      );

      this.logger.log(`댓글 생성: id=${comment.id}, author=${commentAuthor.nickname}, time=${commentTime.toISOString()}`);
    }

    return { postId: post.id, commentCount: generated.comments.length };
  }

  private async getLatestPost() {
    const result = await this.userRepository.manager.query(
      `SELECT id, created_at as "createdAt", category FROM azeyo_community_posts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`,
    );
    return result[0] || null;
  }

  private randomDateBetween(start: Date, end: Date): Date {
    const startMs = start.getTime();
    const endMs = end.getTime();
    if (startMs >= endMs) return new Date(endMs);
    return new Date(startMs + Math.random() * (endMs - startMs));
  }

  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
