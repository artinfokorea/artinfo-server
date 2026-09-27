import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface OngiChatMessageCreator {
  roomId: number;
  /** 시스템 메시지(초대·나가기)는 null */
  senderUserId: number | null;
  type: 'text' | 'photo' | 'system';
  content: string;
  mediaUrl: string | null;
  thumbUrl: string | null;
  /** 사진 가로/세로 비율 — 글·시스템 메시지는 1 */
  aspectRatio: number;
}

@Entity('ongi_chat_messages')
export class OngiChatMessage extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'room_id' })
  roomId: number;

  @Column({ type: 'int', name: 'sender_user_id', nullable: true })
  senderUserId: number | null;

  @Column({ type: 'varchar', name: 'type', length: 8 })
  type: string;

  @Column({ type: 'text', name: 'content', default: '' })
  content: string;

  @Column({ type: 'varchar', name: 'media_url', nullable: true })
  mediaUrl: string | null;

  @Column({ type: 'varchar', name: 'thumb_url', nullable: true })
  thumbUrl: string | null;

  @Column({ type: 'real', name: 'aspect_ratio', default: 1 })
  aspectRatio: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
