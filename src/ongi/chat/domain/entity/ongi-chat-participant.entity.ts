import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** 대화방 참여자 — 사용자 단위 (공간별 구성원 레코드가 아니다) */
@Entity('ongi_chat_participants')
export class OngiChatParticipant extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'room_id' })
  roomId: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'int', name: 'last_read_message_id', default: 0 })
  lastReadMessageId: number;

  /** 이 id 이하 메시지는 볼 수 없다 — 초대되기 전 메시지, 1:1 방을 지우기 전 메시지 */
  @Column({ type: 'int', name: 'visible_from_message_id', default: 0 })
  visibleFromMessageId: number;

  /** 그룹방을 나간 시각 — 다시 초대되면 NULL */
  @Column({ type: 'timestamp', name: 'left_at', nullable: true })
  leftAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
