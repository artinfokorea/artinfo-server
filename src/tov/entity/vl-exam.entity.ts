import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('vl_exams')
export class VlExam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'word_group_id', type: 'uuid' })
  wordGroupId: string;

  @Column({ name: 'start_chapter_number' })
  startChapterNumber: number;

  @Column({ name: 'start_step_number', type: 'int', nullable: true })
  startStepNumber: number | null;

  @Column({ name: 'end_chapter_number' })
  endChapterNumber: number;

  @Column({ name: 'end_step_number', type: 'int', nullable: true })
  endStepNumber: number | null;

  @Column({ name: 'total_questions' })
  totalQuestions: number;

  @Column({ name: 'status', length: 20, default: 'in_progress' })
  status: string;

  @Column({ name: 'pass_status', type: 'varchar', length: 20, nullable: true })
  passStatus: string | null;

  @Column({ name: 'correct_answers', default: 0 })
  correctAnswers: number;

  @Column({ name: 'started_at', type: 'varchar', nullable: true })
  startedAt: string | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
