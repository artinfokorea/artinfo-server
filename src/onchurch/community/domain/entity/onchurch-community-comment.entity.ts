import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// 교제 게시글 댓글. 성도가 즉시 등록하고, 본인 또는 교회 관리자가 삭제한다(대댓글 없음).
@Entity('onchurch_community_comments')
export class OnchurchCommunityComment extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  @Column({ type: 'int', name: 'post_id' })
  postId: number;

  // 작성한 성도(onchurch_users.id)
  @Column({ type: 'int', name: 'author_id' })
  authorId: number;

  // 작성 시점 이름 스냅샷 (표시용)
  @Column({ type: 'varchar', name: 'author_name', length: 80 })
  authorName: string;

  @Column({ type: 'text', name: 'content' })
  content: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
