import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('vl_exam_questions')
export class VlExamQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'exam_id', type: 'uuid' })
  examId: string;

  @Column({ name: 'master_word_id', type: 'uuid' })
  masterWordId: string;

  @Column({ name: 'question_type', length: 50 })
  questionType: string;

  @Column({ name: 'question_number' })
  questionNumber: number;

  @Column({ name: 'question_text', type: 'text' })
  questionText: string;

  @Column({ name: 'correct_answer', type: 'text' })
  correctAnswer: string;

  @Column({ name: 'option_1', type: 'varchar', length: 200, nullable: true })
  option1: string | null;

  @Column({ name: 'option_2', type: 'varchar', length: 200, nullable: true })
  option2: string | null;

  @Column({ name: 'option_3', type: 'varchar', length: 200, nullable: true })
  option3: string | null;

  @Column({ name: 'option_4', type: 'varchar', length: 200, nullable: true })
  option4: string | null;

  @Column({ name: 'option_5', type: 'varchar', length: 200, nullable: true })
  option5: string | null;

  @Column({ name: 'user_answer', type: 'text', nullable: true })
  userAnswer: string | null;

  @Column({ name: 'is_correct', type: 'boolean', nullable: true })
  isCorrect: boolean | null;

  @Column({ name: 'answered_at', type: 'timestamp', nullable: true })
  answeredAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
