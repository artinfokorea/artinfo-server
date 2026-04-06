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

  async execute(): Promise<{ postId: number; commentCount: number; likeCount: number }> {
    // 1. 시드 유저 목록 조회 (seed 이메일 패턴)
    const seedUsers = await this.userRepository
      .createQueryBuilder('u')
      .where("u.email LIKE 'seed%@azeyo.co.kr'")
      .getMany();

    if (seedUsers.length === 0) {
      throw new Error('시드 유저가 없습니다');
    }

    // 2. 최신 글 5개 조회하여 중복 방지
    const recentPosts = await this.getLatestPosts(5);

    // 3. 글 작성 시간 계산: (최신 글 ~ 현재) ∩ (06:30 ~ 23:59 KST) 사이 랜덤
    const [{ db_now, latest_at }] = await this.userRepository.manager.query(
      `SELECT NOW() AS db_now,
        COALESCE(
          (SELECT created_at FROM azeyo_community_posts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1),
          NOW() - INTERVAL '10 minutes'
        ) AS latest_at`,
    );
    const now = new Date(db_now);
    const baseTime = new Date(latest_at);
    const effectiveBaseTime = baseTime.getTime() > now.getTime()
      ? new Date(now.getTime() - 60 * 1000)
      : baseTime;
    const postTime = this.randomDateInAllowedRange(effectiveBaseTime, now);

    if (!postTime) {
      this.logger.log('현재 시간이 허용 범위(06:30~23:59 KST) 밖이므로 시드 생성을 건너뜁니다.');
      return { postId: 0, commentCount: 0, likeCount: 0 };
    }

    // 4. 댓글 수 랜덤 (0~5)
    const commentCount = Math.floor(Math.random() * 6);

    // 5. GPT로 글/댓글 생성 (글 생성 시간을 전달)
    const generated = await this.gptService.generatePost(commentCount, recentPosts, new Date(postTime));

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

    // 8. 투표 글이면 시드 유저들로 랜덤 투표 추가 (3~8명)
    if (generated.voteOptionA && generated.voteOptionB) {
      const voteCount = 3 + Math.floor(Math.random() * 6);
      const voteUsers = [...seedUsers]
        .sort(() => Math.random() - 0.5)
        .slice(0, voteCount);
      for (const voteUser of voteUsers) {
        const option = Math.random() < 0.5 ? 'A' : 'B';
        const voteTime = this.randomDateBetween(postTime, now);
        await this.userRepository.manager.query(
          `INSERT INTO azeyo_community_votes (user_id, post_id, option, created_at) VALUES ($1, $2, $3, $4)`,
          [voteUser.id, post.id, option, voteTime],
        );
      }
      this.logger.log(`투표 생성: ${voteUsers.length}명`);
    }

    // 9. 좋아요 랜덤 추가 (0~10개)
    const likeCount = Math.floor(Math.random() * 11);
    const shuffledUsers = [...seedUsers].sort(() => Math.random() - 0.5);
    const likeUsers = shuffledUsers.filter(u => u.id !== postAuthor.id).slice(0, likeCount);
    for (const likeUser of likeUsers) {
      const likeTime = this.randomDateBetween(postTime, now);
      await this.userRepository.manager.query(
        `INSERT INTO azeyo_community_likes (user_id, target_id, created_at) VALUES ($1, $2, $3)`,
        [likeUser.id, post.id, likeTime],
      );
    }
    if (likeUsers.length > 0) {
      this.logger.log(`좋아요 생성: ${likeUsers.length}개`);
    }

    // 10. 댓글 저장
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

    return { postId: post.id, commentCount: generated.comments.length, likeCount: likeUsers.length };
  }

  private async getLatestPosts(count: number): Promise<{ category: string; title: string }[]> {
    const result = await this.userRepository.manager.query(
      `SELECT category, title FROM azeyo_community_posts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1`,
      [count],
    );
    return result;
  }

  /**
   * (최신 글 ~ 현재) ∩ (06:30 ~ 23:59 KST) 교집합 범위에서 랜덤 시간 반환
   * 교집합이 없으면 null 반환
   */
  private randomDateInAllowedRange(start: Date, end: Date): Date | null {
    const KST_OFFSET = 9 * 60 * 60 * 1000;

    // start~end 사이 날짜들에 대해 허용 구간(06:30~23:59 KST)과의 교집합을 구함
    const startDate = new Date(start.getTime() + KST_OFFSET);
    const endDate = new Date(end.getTime() + KST_OFFSET);

    const startDay = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
    const endDay = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

    const allowedSlots: { from: number; to: number }[] = [];
    const current = new Date(startDay);

    while (current <= endDay) {
      // KST 06:30 ~ 23:59 -> UTC 기준으로 변환
      const dayAllowStart = new Date(current.getTime() + 6 * 60 * 60 * 1000 + 30 * 60 * 1000 - KST_OFFSET).getTime();
      const dayAllowEnd = new Date(current.getTime() + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 - KST_OFFSET).getTime();

      // start~end 와 교집합
      const from = Math.max(dayAllowStart, start.getTime());
      const to = Math.min(dayAllowEnd, end.getTime());

      if (from < to) {
        allowedSlots.push({ from, to });
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    if (allowedSlots.length === 0) return null;

    // 각 슬롯의 길이에 비례하여 랜덤 선택
    const totalMs = allowedSlots.reduce((sum, s) => sum + (s.to - s.from), 0);
    let pick = Math.random() * totalMs;
    for (const slot of allowedSlots) {
      const slotLen = slot.to - slot.from;
      if (pick < slotLen) {
        return new Date(slot.from + pick);
      }
      pick -= slotLen;
    }

    return new Date(allowedSlots[allowedSlots.length - 1].to);
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
