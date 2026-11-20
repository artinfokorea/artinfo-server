import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface OnchurchCommunityBlockRow {
  userId: number;
  name: string;
  createdAt: Date;
}

/**
 * 교제 게시판 사용자 차단 — 내가 차단한 성도의 글·댓글을 내 화면에서 숨기기 위한 목록.
 * synchronize:false 라 기동 시 멱등 DDL 로 테이블을 보장한다 (onchurch_app_versions 와 같은 방식).
 */
@Injectable()
export class OnchurchCommunityBlockRepository implements OnModuleInit {
  private readonly logger = new Logger(OnchurchCommunityBlockRepository.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(`온교회 교제 차단 테이블 생성 실패: ${error}`);
    }
  }

  async ensureSchema(): Promise<void> {
    await this.dataSource.query(`CREATE TABLE IF NOT EXISTS onchurch_community_blocks (
      user_id         INTEGER NOT NULL,
      blocked_user_id INTEGER NOT NULL,
      created_at      TIMESTAMP NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, blocked_user_id)
    )`);
  }

  /** 탈퇴한 계정도 차단 해제할 수 있게 목록에 남긴다 */
  async findByUserId(userId: number): Promise<OnchurchCommunityBlockRow[]> {
    return this.dataSource.query(
      `SELECT b.blocked_user_id AS "userId", COALESCE(u.name, '탈퇴한 회원') AS name, b.created_at AS "createdAt"
         FROM onchurch_community_blocks b
         LEFT JOIN onchurch_users u ON u.id = b.blocked_user_id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC`,
      [userId],
    );
  }

  async add(userId: number, blockedUserId: number): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO onchurch_community_blocks (user_id, blocked_user_id) VALUES ($1, $2) ON CONFLICT (user_id, blocked_user_id) DO NOTHING`,
      [userId, blockedUserId],
    );
  }

  async remove(userId: number, blockedUserId: number): Promise<void> {
    await this.dataSource.query(`DELETE FROM onchurch_community_blocks WHERE user_id = $1 AND blocked_user_id = $2`, [userId, blockedUserId]);
  }
}
