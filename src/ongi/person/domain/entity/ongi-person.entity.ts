import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface OngiPersonCreator {
  groupId: number;
  name: string;
  imageUrl: string | null;
  /** 그룹 구성원에서 자동 생성된 인물이면 해당 구성원 id (수동 추가 인물은 null) */
  memberId?: number | null;
}

/** 인물 태그 대상 — 구성원이 아닌 아이 등도 포함되므로 member 와 별개 */
@Entity('ongi_people')
export class OngiPerson extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'group_id' })
  groupId: number;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'image_url', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'int', name: 'member_id', nullable: true })
  memberId: number | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
