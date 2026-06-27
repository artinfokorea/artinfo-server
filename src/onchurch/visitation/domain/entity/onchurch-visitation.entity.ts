import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onchurch_visitations')
export class OnchurchVisitation extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'church_id' })
  churchId: number;

  // 심방 대상 성도. 성도명부에서 선택해 만들지만 이름은 스냅샷(텍스트)으로 보관한다.
  @Column({ type: 'int', name: 'saint_id', nullable: true })
  saintId: number | null;

  @Column({ type: 'varchar', name: 'saint_name', length: 80 })
  saintName: string;

  // 교역자(심방한 사람) — 텍스트 기입.
  @Column({ type: 'varchar', name: 'minister', length: 80 })
  minister: string;

  // 심방 종류 — 종류 목록에서 고른 이름을 스냅샷으로 저장(종류 삭제·변경과 무관하게 유지).
  @Column({ type: 'varchar', name: 'type', length: 40 })
  type: string;

  // 심방 날짜 YYYY-MM-DD.
  @Column({ type: 'varchar', name: 'visit_date', length: 10 })
  date: string;

  @Column({ type: 'text', name: 'content', nullable: true })
  content: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
