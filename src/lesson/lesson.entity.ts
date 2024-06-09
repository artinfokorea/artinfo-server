import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lessons')
export class Lesson extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'number', name: 'pay' })
  pay: number;

  @Column({ type: 'varchar', name: 'introduction' })
  introduction: string;

  @Column({ type: 'varchar', name: 'career' })
  career: string;
}
