import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface OngiChatRoomCreator {
  type: 'direct' | 'group';
  name: string | null;
  directKey: string | null;
  creatorUserId: number;
}

/** 대화방 — 가족 공간과 따로 존재한다. 공간을 나가거나 공간이 삭제돼도 방·메시지는 남는다 */
@Entity('ongi_chat_rooms')
export class OngiChatRoom extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'type', length: 8 })
  type: string;

  @Column({ type: 'varchar', name: 'name', length: 30, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', name: 'direct_key', length: 32, nullable: true })
  directKey: string | null;

  @Column({ type: 'int', name: 'creator_user_id' })
  creatorUserId: number;

  @Column({ type: 'int', name: 'last_message_id', nullable: true })
  lastMessageId: number | null;

  @Column({ type: 'timestamp', name: 'last_message_at', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
