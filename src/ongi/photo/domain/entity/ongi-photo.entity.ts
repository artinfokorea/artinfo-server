import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface OngiPhotoCreator {
  groupId: number;
  authorMemberId: number;
  albumId: number | null;
  url: string;
  aspectRatio: number;
  caption: string | null;
  location: string | null;
  personIds: number[];
}

@Entity('ongi_photos')
export class OngiPhoto extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'group_id' })
  groupId: number;

  @Column({ type: 'int', name: 'author_member_id' })
  authorMemberId: number;

  @Column({ type: 'int', name: 'album_id', nullable: true })
  albumId: number | null;

  @Column({ type: 'varchar', name: 'url' })
  url: string;

  @Column({ type: 'double precision', name: 'aspect_ratio', default: 1 })
  aspectRatio: number;

  @Column({ type: 'varchar', name: 'caption', nullable: true })
  caption: string | null;

  @Column({ type: 'varchar', name: 'location', nullable: true })
  location: string | null;

  @Column({ type: 'jsonb', name: 'person_ids', default: () => "'[]'::jsonb" })
  personIds: number[];

  @Column({ type: 'int', name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ type: 'int', name: 'comment_count', default: 0 })
  commentCount: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
