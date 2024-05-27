import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FullTimeJobMajorCategory } from '@/job/entity/full-time-job-major-category.entity';

export enum FULL_TIME_JOB_TYPE {
  ART_ORGANIZATION = 'ART_ORGANIZATION',
  RELIGION = 'RELIGION',
}

export enum PROVINCE_TYPE {
  SEOUL = 'SEOUL',
  GYEONGGIDO = 'GYEONGGIDO',
  INCHEON = 'INCHEON',
  GANGWONDO = 'GANGWONDO',
  CHUNGCHEONGBUKDO = 'CHUNGCHEONGBUKDO',
  CHUNGCHEONGNAMDO = 'CHUNGCHEONGNAMDO',
  DAEJEON = 'DAEJEON',
  SEJONG = 'SEJONG',
  JEOLLABUKDO = 'JEOLLABUKDO',
  JEOLLANAMDO = 'JEOLLANAMDO',
  GWANGJU = 'GWANGJU',
  GYEONGSANGBUKDO = 'GYEONGSANGBUKDO',
  GYEONGSANGNAMDO = 'GYEONGSANGNAMDO',
  BUSAN = 'BUSAN',
  DAEGU = 'DAEGU',
  ULSAN = 'ULSAN',
  JEJU = 'JEJU',
  NONE = 'NONE',
}

@Entity('full_time_jobs')
export class FullTimeJob extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'enum', enum: FULL_TIME_JOB_TYPE, name: 'type' })
  type: FULL_TIME_JOB_TYPE;

  @Column({ type: 'varchar', name: 'title' })
  title: string;

  @Column({ type: 'varchar', name: 'company_name' })
  companyName: string;

  @Column({ type: 'text', name: 'contents' })
  contents: string;

  @Column({ type: 'enum', enum: PROVINCE_TYPE, name: 'province', nullable: true })
  province: PROVINCE_TYPE;

  @Column({ type: 'varchar', name: 'address', nullable: true })
  address: string | null;

  @Column({ type: 'int', name: 'fee', nullable: true })
  fee: number | null;

  @Column({ type: 'text', name: 'image_url', nullable: true })
  imageUrl: string | null;

  @OneToMany(() => FullTimeJobMajorCategory, fullTimeJobMajorCategory => fullTimeJobMajorCategory.fullTimeJob)
  fullTimeJobMajorCategories: FullTimeJobMajorCategory[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;
}
