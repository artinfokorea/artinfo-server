import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Job } from '@/job/entity/job.entity';
import { School } from '@/user/entity/school.entity';
import { UserMajorCategory } from '@/user/entity/user-major-category.entity';
import { Lesson } from '@/lesson/entity/lesson.entity';

export enum USER_TYPE {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
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

  @Column({ type: 'varchar', name: 'temp_password', nullable: true })
  tempPassword: string | null;

  @Column({ type: 'varchar', name: 'icon_image_url', nullable: true })
  iconImageUrl: string | null;

  @OneToOne(() => Lesson, lesson => lesson.user, { eager: true, cascade: true })
  lesson: Lesson;

  @OneToMany(() => School, school => school.user, { eager: true, cascade: true })
  schools: School[];

  @OneToMany(() => Job, fullTimeJob => fullTimeJob.user, { cascade: true })
  jobs: Job[];

  @OneToMany(() => UserMajorCategory, userMajorCategory => userMajorCategory.user, { eager: true, cascade: true })
  userMajorCategories: UserMajorCategory[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
