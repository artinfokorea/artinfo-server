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

    // 3. 글 작성 시간 계산: (최신 글 ~ 현재) ∩ (06:30 ~ 12:00 KST) 사이 랜덤
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
    const postTime = this.randomDateInAllowedWindow(effectiveBaseTime, now);

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
   * (start ~ end) ∩ (매일 06:30 ~ 12:00 KST) 교집합 구간에서 랜덤 시간 반환
   */
  private randomDateInAllowedWindow(start: Date, end: Date): Date {
    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
    const WINDOW_START_MIN = 6 * 60 + 30; // 06:30 in minutes
    const WINDOW_END_MIN = 12 * 60;       // 12:00 in minutes

    const slots: Array<{ start: number; end: number }> = [];

    // KST 기준 날짜 범위 산출
    const startKstDay = new Date(start.getTime() + KST_OFFSET_MS);
    startKstDay.setUTCHours(0, 0, 0, 0);
    const endKstDay = new Date(end.getTime() + KST_OFFSET_MS);
    endKstDay.setUTCHours(0, 0, 0, 0);

    for (
      const d = new Date(startKstDay);
      d.getTime() <= endKstDay.getTime();
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      // 이 날의 06:30~12:00 KST → UTC 변환
      const winStartUtc = d.getTime() + WINDOW_START_MIN * 60 * 1000 - KST_OFFSET_MS;
      const winEndUtc = d.getTime() + WINDOW_END_MIN * 60 * 1000 - KST_OFFSET_MS;

      const intStart = Math.max(winStartUtc, start.getTime());
      const intEnd = Math.min(winEndUtc, end.getTime());

      if (intStart < intEnd) {
        slots.push({ start: intStart, end: intEnd });
      }
    }

    if (slots.length === 0) {
      // 교집합이 없으면 now 반환 (스케줄러가 허용 시간대 밖에서 돈 경우)
      this.logger.warn('허용 시간대(06:30~12:00 KST) 교집합 없음 — now 사용');
      return end;
    }

    // 구간 길이에 비례하여 랜덤 선택
    const totalMs = slots.reduce((sum, s) => sum + (s.end - s.start), 0);
    let pick = Math.random() * totalMs;

    for (const slot of slots) {
      const len = slot.end - slot.start;
      if (pick <= len) {
        return new Date(slot.start + pick);
      }
      pick -= len;
    }

    return new Date(slots[slots.length - 1].end);
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
