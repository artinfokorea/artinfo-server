import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';
import { User } from '@/user/entity/user.entity';
import { PostCreator } from '@/post/repository/dto/PostCreator';

@Entity('posts')
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'category' })
  category: PostCategoryEnum;

  @Column({ name: 'title' })
  title: string;

  @Column({ type: 'text', name: 'contents' })
  contents: string;

  @Column({ type: 'text', name: 'thumbnail_image_url', nullable: true })
  thumbnailImageUrl: string | null;

  @Column({ type: 'int', name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ type: 'int', name: 'like_count', default: 0 })
  likeCount: number;

  isLiked: boolean = false;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  constructor(init?: Partial<PostEntity>) {
    super();
    if (init) {
      Object.assign(this, init);
    }
  }

  static fromCreator(creator: PostCreator) {
    return new PostEntity({
      userId: creator.userId,
      category: creator.category,
      title: creator.title,
      contents: creator.contents,
      thumbnailImageUrl: creator.thumbnailImageUrl,
    });
  }

  hasLike() {
    this.isLiked = true;
  }
}
