import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '@/user/entity/user.entity';
import { PostEntity } from '@/post/PostEntity';

export enum COMMENT_TYPE {
  NEWS = 'NEWS',
  POST = 'POST',
}
export interface CommentRaw {
  comment_id: number;
  comment_type: COMMENT_TYPE;
  comment_target_id: number;
  comment_parent_id: number;
  comment_contents: string;
  comment_created_at: Date;
  comment_updated_at: Date;
  children_count: number;
}

@Entity('comments')
export class CommentEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'enum', enum: COMMENT_TYPE, name: 'type' })
  type: COMMENT_TYPE;

  @ManyToOne(() => PostEntity, post => post.comments)
  @JoinColumn({ name: 'target_id' })
  post: PostEntity;

  @Column({ name: 'target_id' })
  targetId: number;

  @Column({ type: 'int', name: 'parent_id', nullable: true })
  parentId: number | null;

  @Column({ type: 'varchar', name: 'contents' })
  contents: string;

  @ManyToOne(() => User, user => user.comments, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;

  childrenCount: number;

  fromRaw(raw: CommentRaw) {
    const comment = new CommentEntity();
    comment.id = raw.comment_id;
    comment.type = raw.comment_type;
    comment.targetId = raw.comment_target_id;
    comment.parentId = raw.comment_parent_id;
    comment.contents = raw.comment_contents;
    comment.createdAt = raw.comment_created_at;
    comment.updateAt = raw.comment_updated_at;
    comment.childrenCount = Number(raw.children_count);

    return comment;
  }

  setUser(user: User) {
    this.user = user;
    return this;
  }
}
