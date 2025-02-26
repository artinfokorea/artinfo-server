import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lesson_applications')
export class LessonApplicationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'applicant_id' })
  applicantId: number;

  @Column({ type: 'int', name: 'teacher_id' })
  teacherId: number;

  @Column({ type: 'varchar', name: 'contents' })
  contents: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
