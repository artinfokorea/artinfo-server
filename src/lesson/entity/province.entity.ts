import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PROVINCE_TYPE } from '@/system/entity/province';
import { Lesson } from '@/lesson/entity/lesson.entity';

@Entity('provinces')
export class Province extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'type' })
  type: PROVINCE_TYPE;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @ManyToOne(() => Lesson, lesson => lesson.provinces)
  @JoinColumn({ name: 'lesson_id', referencedColumnName: 'id' })
  lesson: Lesson;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
