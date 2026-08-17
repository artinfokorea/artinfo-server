import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface OngiPhotoCommentCreator {
  photoId: number;
  authorMemberId: number;
  text: string;
}

@Entity('ongi_photo_comments')
export class OngiPhotoComment extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'photo_id' })
  photoId: number;

  @Column({ type: 'int', name: 'author_member_id' })
  authorMemberId: number;

  @Column({ type: 'varchar', name: 'text' })
  text: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
