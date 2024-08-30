import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PerformanceArea } from '@/performance/performance-area.entity';

export enum PERFORMANCE_CATEGORY {
  CLASSIC = 'CLASSIC',
  MUSICAL = 'MUSICAL',
  DANCE = 'DANCE',
  TRADITIONAL_MUSIC = 'TRADITIONAL_MUSIC',
}

@Entity('performances')
export class Performance {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'kopis_id', nullable: true })
  kopisId: string | null;

  @Column({ type: 'varchar', name: 'title' })
  title: string;

  @Column({ type: 'varchar', name: 'introduction' })
  introduction: string;

  @Column({ type: 'enum', enum: PERFORMANCE_CATEGORY })
  category: PERFORMANCE_CATEGORY;

  @Column({ type: 'varchar', name: 'custom_area_name', nullable: true })
  customAreaName: string | null;

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

  @Column({ type: 'varchar', name: 'poster_image_url' })
  posterImageUrl: string;

  @Column({ type: 'varchar', name: 'reservation_url', nullable: true })
  reservationUrl: string | null;

  @Column({ type: 'timestamp', name: 'start_at' })
  startAt: Date;

  @Column({ type: 'timestamp', name: 'end_at' })
  endAt: Date;

  @ManyToOne(() => PerformanceArea, performanceArea => performanceArea.performances)
  @JoinColumn({ name: 'performance_area_id' })
  performanceArea: PerformanceArea;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;
}