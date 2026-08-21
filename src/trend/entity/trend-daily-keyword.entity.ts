import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** 일자별 키워드 순위 결산 (자정 롤업으로 Redis → DB 확정) */
@Entity('trend_daily_keywords')
@Index('uq_trend_daily_keywords_date_keyword', ['date', 'keyword'], { unique: true })
@Index('idx_trend_daily_keywords_keyword', ['keyword'])
export class TrendDailyKeyword extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  /** KST 기준 YYYY-MM-DD */
  @Column({ type: 'date', name: 'date' })
  date: string;

  @Column({ type: 'varchar', name: 'keyword', length: 100 })
  keyword: string;

  @Column({ type: 'smallint', name: 'peak' })
  peak: number;

  @Column({ type: 'timestamptz', name: 'peak_at' })
  peakAt: Date;

  @Column({ type: 'timestamptz', name: 'first_seen' })
  firstSeen: Date;

  @Column({ type: 'timestamptz', name: 'last_seen' })
  lastSeen: Date;

  @Column({ type: 'int', name: 'samples' })
  samples: number;

  @Column({ type: 'int', name: 'score' })
  score: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
