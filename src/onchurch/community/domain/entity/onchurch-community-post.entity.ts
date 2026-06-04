import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onchurch_community_posts')
export class OnchurchCommunityPost extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  // 작성한 성도(onchurch_users.id)
  @Column({ type: 'int', name: 'author_id' })
  authorId: number;

  // 작성 시점 이름 스냅샷 (표시용)
  @Column({ type: 'varchar', name: 'author_name', length: 80 })
  authorName: string;

  @Column({ type: 'varchar', name: 'category', nullable: true, length: 50 })
  category: string | null;

  @Column({ type: 'varchar', name: 'title', length: 300 })
  title: string;

  @Column({ type: 'text', name: 'content', nullable: true })
  content: string | null;

  // 업로드된 사진 URL 배열
  @Column({ type: 'jsonb', name: 'photo_urls', default: () => "'[]'::jsonb" })
  photoUrls: string[];

  // 외부 동영상 링크 (YouTube/Vimeo 등)
  @Column({ type: 'varchar', name: 'video_url', nullable: true, length: 1000 })
  videoUrl: string | null;

  // 관리자 사후 숨김 (즉시 공개 + 사후 관리)
  @Column({ type: 'boolean', name: 'is_hidden', default: false })
  isHidden: boolean;

  // 신고 누적 수
  @Column({ type: 'int', name: 'report_count', default: 0 })
  reportCount: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
