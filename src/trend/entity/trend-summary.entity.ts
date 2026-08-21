import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** AI 요약 생성 이력 — Redis 캐시와 별개로 영구 보관 (결산·키워드 히스토리용) */
@Entity('trend_summaries')
@Index('idx_trend_summaries_keyword_generated', ['keyword', 'generatedAt'])
export class TrendSummaryEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'keyword', length: 100 })
  keyword: string;

  @Column({ type: 'varchar', name: 'region', length: 8 })
  region: string;

  @Column({ type: 'varchar', name: 'headline' })
  headline: string;

  @Column({ type: 'text', name: 'summary' })
  summary: string;

  @Column({ type: 'jsonb', name: 'bullets' })
  bullets: string[];

  @Column({ type: 'jsonb', name: 'people' })
  people: unknown[];

  @Column({ type: 'jsonb', name: 'articles' })
  articles: unknown[];

  @Column({ type: 'varchar', name: 'model', length: 64 })
  model: string;

  @Column({ type: 'timestamptz', name: 'generated_at' })
  generatedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
