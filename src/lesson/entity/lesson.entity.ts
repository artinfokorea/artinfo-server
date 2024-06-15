import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '@/user/entity/user.entity';
import { LessonArea } from '@/lesson/entity/lesson-area.entity';

@Entity('lessons')
export class Lesson extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'pay' })
  pay: number;

  @Column({ type: 'varchar', name: 'introduction' })
  introduction: string;

  @Column({ type: 'varchar', name: 'career', nullable: true })
  career: string | null;

  @Column({ type: 'varchar', name: 'image_url' })
  imageUrl: string;

  @OneToOne(() => User, user => user.lesson)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => LessonArea, lessonAreas => lessonAreas.lesson, { eager: true, cascade: true })
  areas: LessonArea[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;
}
