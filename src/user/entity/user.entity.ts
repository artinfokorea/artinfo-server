import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Job } from '@/job/entity/job.entity';
import { School } from '@/user/entity/school.entity';
import { UserMajorCategory } from '@/user/entity/user-major-category.entity';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { CommentEntity } from '@/comment/comment.entity';
import { Performance } from '@/performance/performance.entity';
import { JobUser } from '@/job/entity/job-user.entity';
import { PostEntity } from '@/post/PostEntity';

export enum USER_TYPE {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}

export interface UserRaw {
  user_id: number;
  user_type: USER_TYPE;
  user_name: string;
  user_nickname: string;
  user_email: string;
  user_phone: string | null;
  user_birth: Date | null;
  user_password: string | null;
  user_icon_image_url: string | null;
  user_created_at: Date;
  user_updated_at: Date;
  user_deleted_at: Date | null;
}

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'type', default: USER_TYPE.CLIENT })
  type: USER_TYPE;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'nickname' })
  nickname: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'phone', nullable: true })
  phone: string | null;

  @Column({ type: 'timestamp', name: 'birth', nullable: true })
  birth: Date | null;

  @Column({ type: 'varchar', name: 'password', nullable: true })
  password: string | null;

  @Column({ type: 'varchar', name: 'icon_image_url', nullable: true })
  iconImageUrl: string | null;

  @OneToOne(() => Lesson, lesson => lesson.user, { eager: true, cascade: true })
  lesson: Lesson;

  @OneToMany(() => School, school => school.user, { eager: true, cascade: true })
  schools: School[];

  @OneToMany(() => CommentEntity, comment => comment.user, { cascade: true })
  comments: CommentEntity[];

  @OneToMany(() => Job, fullTimeJob => fullTimeJob.user, { cascade: true })
  jobs: Job[];

  @OneToMany(() => PostEntity, post => post.user)
  posts: PostEntity[];

  @OneToMany(() => Performance, performance => performance.user)
  performances: Performance[];

  @OneToMany(() => UserMajorCategory, userMajorCategory => userMajorCategory.user, { eager: true, cascade: true })
  userMajorCategories: UserMajorCategory[];

  @OneToMany(() => JobUser, jobUsers => jobUsers.user, { eager: true, cascade: true })
  jobUsers: JobUser[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  fromRaw(userRaw: UserRaw): User {
    const user = new User();
    user.id = userRaw.user_id;
    user.type = userRaw.user_type;
    user.name = userRaw.user_name;
    user.nickname = userRaw.user_nickname;
    user.email = userRaw.user_email;
    user.phone = userRaw.user_phone;
    user.birth = userRaw.user_birth;
    user.password = userRaw.user_password;
    user.iconImageUrl = userRaw.user_icon_image_url;
    user.createdAt = userRaw.user_created_at;
    user.updateAt = userRaw.user_updated_at;
    user.deletedAt = userRaw.user_deleted_at;

    return user;
  }
}
