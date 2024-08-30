import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Performance } from '@/performance/performance.entity';
import { Province } from '@/lesson/entity/province.entity';

@Entity('performanceAreas')
export class PerformanceArea {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'address' })
  address: string;

  @Column({ type: 'decimal', name: 'latitude' })
  latitude: number;

  @Column({ type: 'decimal', name: 'longitude' })
  longitude: number;

  @Column({ type: 'int', name: 'seat_scale' })
  seatScale: number;

  @Column({ type: 'varchar', name: 'site_url' })
  siteUrl: string;

  @Column({ type: 'varchar', name: 'area_type' })
  type: string;

  @ManyToOne(() => Province, province => province.performanceAreas)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @OneToMany(() => Performance, performance => performance.performanceArea)
  performances: Performance[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
