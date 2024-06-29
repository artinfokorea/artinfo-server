import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { JobMajorCategory } from '@/job/entity/job-major-category.entity';
import { UserMajorCategory } from '@/user/entity/user-major-category.entity';

export enum ART_CATEGORY {
  MUSIC = 'MUSIC',
  ART = 'ART',
}

export enum PROFESSIONAL_FIELD_CATEGORY {
  CLASSIC = 'CLASSIC',
  POPULAR_MUSIC = 'POPULAR_MUSIC',
  TRADITIONAL_MUSIC = 'TRADITIONAL_MUSIC',
  ADMINISTRATION = 'ADMINISTRATION',
}

export enum MAJOR {
  CONDUCTOR = 'CONDUCTOR',
  COMPOSER = 'COMPOSER',
  PERCUSSION = 'PERCUSSION',
  PIANO = 'PIANO',
  ORGAN = 'ORGAN',
  PLANNING = 'PLANNING',
  ADVERTISEMENT = 'ADVERTISEMENT',
  MANAGEMENT = 'MANAGEMENT',
  ETC = 'ETC',
  SOPRANO = 'SOPRANO',
  MEZZO_SOPRANO = 'MEZZO_SOPRANO',
  ALTO = 'ALTO',
  TENOR = 'TENOR',
  BARITONE = 'BARITONE',
  BASS = 'BASS',
  VIOLIN = 'VIOLIN',
  VIOLA = 'VIOLA',
  CELLO = 'CELLO',
  DOUBLE_BASE = 'DOUBLE_BASE',
  HARP = 'HARP',
  FLUTE = 'FLUTE',
  OBOE = 'OBOE',
  CLARINET = 'CLARINET',
  BASSOON = 'BASSOON',
  HORN = 'HORN',
  TRUMPET = 'TRUMPET',
  TROMBONE = 'TROMBONE',
  TUBA = 'TUBA',
  ELECTRIC_GUITAR = 'ELECTRIC_GUITAR',
  BASS_GUITAR = 'BASS_GUITAR',
  DRUM = 'DRUM',
  VOCAL = 'VOCAL',
  ACOUSTIC_GUITAR = 'ACOUSTIC_GUITAR',
  MIDI = 'MIDI',
  GAYAGEUM = 'GAYAGEUM',
  GEOMUNGO = 'GEOMUNGO',
  AJAENG = 'AJAENG',
  HAEGEUM = 'HAEGEUM',
  DAEGEUM = 'DAEGEUM',
  SOGEUM = 'SOGEUM',
  DANSO = 'DANSO',
  PEERI = 'PEERI',
  TAEPYEONGSO = 'TAEPYEONGSO',
  SAMULNORI = 'SAMULNORI',
  JANGGU = 'JANGGU',
  PANSORI = 'PANSORI',
  MINYO = 'MINYO',
}

@Entity('major_categories')
export class MajorCategory extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'first_group_ko', nullable: true })
  firstGroupKo: string;

  @Column({ type: 'enum', enum: ART_CATEGORY, name: 'first_group_en' })
  firstGroupEn: ART_CATEGORY;

  @Column({ type: 'varchar', name: 'second_group_ko', nullable: true })
  secondGroupKo: string;

  @Column({ type: 'enum', enum: PROFESSIONAL_FIELD_CATEGORY, name: 'second_group_en', nullable: true })
  secondGroupEn: PROFESSIONAL_FIELD_CATEGORY;

  @Column({ type: 'varchar', name: 'ko_name' })
  koName: string;

  @Column({ type: 'varchar', name: 'en_name' })
  enName: string;

  @OneToMany(() => JobMajorCategory, jobMajorCategory => jobMajorCategory.majorCategory, { cascade: true })
  jobMajorCategories: JobMajorCategory[];

  @OneToMany(() => UserMajorCategory, userMajorCategory => userMajorCategory.majorCategory, { cascade: true })
  userMajorCategories: UserMajorCategory[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;
}
