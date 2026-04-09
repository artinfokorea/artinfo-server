import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('azeyo_alimtalk_histories')
export class AzeyoAlimtalkHistory extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', name: 'phone' })
  phone: string;

  @Column({ type: 'varchar', name: 'template_id' })
  templateId: string;

  @Column({ type: 'jsonb', name: 'variables', nullable: true })
  variables: Record<string, string> | null;

  @Column({ type: 'boolean', name: 'is_success', default: true })
  isSuccess: boolean;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
