import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum IMAGE_TARGET {
  USER = 'USER',
  JOB = 'JOB',
  LESSON = 'LESSON',
  NEWS = 'NEWS',
  PERFORMANCE = 'PERFORMANCE',
}

@Entity({ name: 'images' })
export class ImageEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  userId!: number;

  @Column({ type: 'enum', enum: IMAGE_TARGET })
  target!: IMAGE_TARGET;

  @Column({ type: 'text', nullable: true })
  originalFilename!: string;

  @Column()
  groupPath!: string;

  @Column()
  savedFilename!: string;

  @Column()
  savedPath!: string;

  @Column()
  mimeType!: string;

  @Column()
  width!: number;

  @Column()
  height!: number;

  @Column()
  size!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updateAt: Date;
}
