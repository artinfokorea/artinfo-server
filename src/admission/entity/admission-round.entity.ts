import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Admission } from '@/admission/entity/admission.entity';
import { AdmissionRoundTask } from '@/admission/entity/admission-round-task.entity';

@Entity('admission_rounds')
export class AdmissionRound {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'smallint', name: 'round_number' })
  roundNumber: number;

  @Column({ type: 'timestamp', name: 'exam_start_at' })
  examStartAt: Date;

  @Column({ type: 'timestamp', name: 'exam_end_at' })
  examEndAt: Date;

  @Column({ type: 'timestamp', name: 'result_at', nullable: true })
  resultAt: Date | null;

  @Column({ type: 'timestamp', name: 'registration_start_at', nullable: true })
  registrationStartAt: Date | null;

  @Column({ type: 'timestamp', name: 'registration_end_at', nullable: true })
  registrationEndAt: Date | null;

  @Column({ type: 'varchar', name: 'note', nullable: true })
  note: string | null;

  @ManyToOne(() => Admission, admission => admission.rounds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admission_id', referencedColumnName: 'id' })
  admission: Admission;

  @Column({ name: 'admission_id' })
  admissionId: number;

  @OneToMany(() => AdmissionRoundTask, task => task.round, { cascade: true })
  tasks: AdmissionRoundTask[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
