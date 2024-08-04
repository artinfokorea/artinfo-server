import { BaseEntity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum PERFORMANCE_CATEGORY {
  CLASSIC = 'CLASSIC',
  MUSICAL = 'MUSICAL',
  DANCE = 'DANCE',
  TRADITIONAL_MUSIC = 'TRADITIONAL_MUSIC',
}

export class Performance extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'title' })
  title: string;

  @Column({ type: 'varchar', name: 'introduction' })
  introduction: string;

  @Column({ type: 'enum', enum: PERFORMANCE_CATEGORY, name: 'category' })
  category: PERFORMANCE_CATEGORY;

  @Column({ type: 'varchar', name: 'time' })
  time: string;

  @Column({ type: 'varchar', name: 'age' })
  age: string;

  @Column({ type: 'varchar', name: 'cast' })
  cast: string;

  @Column({ type: 'varchar', name: 'ticket_price' })
  ticketPrice: string;

  @Column({ type: 'varchar', name: 'host' })
  host: string;

  @Column({ type: 'varchar', name: 'reservation_url' })
  reservationUrl: string;

  @Column({ type: 'timestamp', name: 'start_At' })
  startAt: Date;

  @Column({ type: 'timestamp', name: 'end_At' })
  endAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;
}
