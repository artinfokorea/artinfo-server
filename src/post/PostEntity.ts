import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostCategoryEnum } from '@/post/enum/PostCategoryEnum';
import { User } from '@/user/entity/user.entity';
import { PostCreator } from '@/post/repository/dto/PostCreator';
import { PostEditor } from '@/post/repository/dto/PostEditor';
import { LikeEntity } from '@/like/LikeEntity';
import { CommentEntity } from '@/comment/comment.entity';

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

  @OneToMany(() => LikeEntity, like => like.post)
  likes: LikeEntity[];

  @OneToMany(() => CommentEntity, comment => comment.post)
  comments: CommentEntity[];

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

  increaseViewCount() {
    this.viewCount += 1;
    return this;
  }

  hasLike() {
    this.isLiked = true;
  }

  edit(editor: PostEditor) {
    this.category = editor.category;
    this.title = editor.title;
    this.contents = editor.contents;
    this.thumbnailImageUrl = editor.thumbnailImageUrl;

    return this;
  }
}
