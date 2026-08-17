import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** 따뜻해요 — 사용자 × 사진 */
@Entity('ongi_photo_likes')
export class OngiPhotoLike extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'photo_id' })
  photoId: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
