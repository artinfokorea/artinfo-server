import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@/user/entity/user.entity';

export enum SCHOOL_TYPE {
  UNDERGRADUATE = 'UNDERGRADUATE',
  MASTER = 'MASTER',
  DOCTOR = 'DOCTOR',
}

@Entity('schools')
export class School extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'type' })
  type: SCHOOL_TYPE;

  @Column({ name: 'name' })
  name: string;

  @ManyToOne(() => User, user => user.schools)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
