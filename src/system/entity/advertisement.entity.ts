import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ADVERTISEMENT_TYPE {
  BANNER = 'BANNER',
  CONCERT = 'CONCERT',
}

export interface AdvertisementCreator {
  type: ADVERTISEMENT_TYPE;
  title: string;
  imageUrl: string;
  redirectUrl: string | null;
}

@Entity('advertisement')
export class Advertisement extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'enum', enum: ADVERTISEMENT_TYPE, name: 'type' })
  type: ADVERTISEMENT_TYPE;

  @Column({ type: 'varchar', name: 'title' })
  title: string;

  @Column({ type: 'varchar', name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'varchar', name: 'redirect_url', nullable: true })
  redirectUrl: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;

  constructor(creator: AdvertisementCreator) {
    super();
    if (creator) {
      this.type = creator.type;
      this.title = creator.title;
      this.imageUrl = creator.imageUrl;
      this.redirectUrl = creator.redirectUrl;
    }
  }
}
