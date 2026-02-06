import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AdmissionRound } from '@/admission/entity/admission-round.entity';

@Entity('admission_round_tasks')
export class AdmissionRoundTask {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'description' })
  description: string;

  @Column({ type: 'smallint', name: 'sequence' })
  sequence: number;

  @Column({ type: 'varchar', name: 'note', nullable: true })
  note: string | null;

  @ManyToOne(() => AdmissionRound, round => round.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admission_round_id', referencedColumnName: 'id' })
  round: AdmissionRound;

  @Column({ name: 'admission_round_id' })
  admissionRoundId: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
