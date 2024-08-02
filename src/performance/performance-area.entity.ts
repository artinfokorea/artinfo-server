import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('performance_areas')
export class PerformanceArea extends BaseEntity {
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

  @Column({ type: 'varchar', name: 'site_url', nullable: true })
  siteUrl: string | null;

  @Column({ type: 'varchar', name: 'area_type' })
  areaType: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
