import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FullTimeJobMajorCategory } from '@/job/entity/full-time-job-major-category.entity';

export enum MUSIC_MAJOR_ETC {
  CONDUCTOR = 'CONDUCTOR',
  COMPOSER = 'COMPOSER',
  PERCUSSION = 'PERCUSSION',
}

export enum MUSIC_MAJOR_KEYBOARD {
  PIANO = 'PIANO',
  ORGAN = 'ORGAN',
}

export enum MUSIC_MAJOR_ADMINISTRATION {
  PLANNING = 'PLANNING',
  ADVERTISEMENT = 'ADVERTISEMENT',
  MANAGEMENT = 'MANAGEMENT',
  ETC = 'ETC',
}

export enum MUSIC_MAJOR_VOCAL {
  SOPRANO = 'SOPRANO',
  MEZZO_SOPRANO = 'MEZZO_SOPRANO',
  ALTO = 'ALTO',
  TENOR = 'TENOR',
  BARITONE = 'BARITONE',
  BASS = 'BASS',
}

export enum MUSIC_MAJOR_STRING {
  VIOLIN = 'VIOLIN',
  VIOLA = 'VIOLA',
  CELLO = 'CELLO',
  DOUBLE_BASE = 'DOUBLE_BASE',
  HARP = 'HARP',
}

export enum MUSIC_MAJOR_BRASS {
  FLUTE = 'FLUTE',
  OBOE = 'OBOE',
  CLARINET = 'CLARINET',
  BASSOON = 'BASSOON',
  HORN = 'HORN',
  TRUMPET = 'TRUMPET',
  TROMBONE = 'TROMBONE',
  TUBA = 'TUBA',
}

export enum MUSIC_MAJOR_POPULAR_MUSIC {
  ELECTRIC_GUITAR = 'ELECTRIC_GUITAR',
  BASS_GUITAR = 'BASS_GUITAR',
  DRUM = 'DRUM',
  VOCAL = 'VOCAL',
  ACOUSTIC_GUITAR = 'ACOUSTIC_GUITAR',
  MIDI = 'MIDI',
}

export enum MUSIC_MAJOR_TRADITIONAL_MUSIC {
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

export enum MAJOR {
  CONDUCTOR = MUSIC_MAJOR_ETC.CONDUCTOR,
  COMPOSER = MUSIC_MAJOR_ETC.COMPOSER,
  PERCUSSION = MUSIC_MAJOR_ETC.PERCUSSION,
  PIANO = MUSIC_MAJOR_KEYBOARD.PIANO,
  ORGAN = MUSIC_MAJOR_KEYBOARD.ORGAN,
  PLANNING = MUSIC_MAJOR_ADMINISTRATION.PLANNING,
  ADVERTISEMENT = MUSIC_MAJOR_ADMINISTRATION.ADVERTISEMENT,
  MANAGEMENT = MUSIC_MAJOR_ADMINISTRATION.MANAGEMENT,
  ETC = MUSIC_MAJOR_ADMINISTRATION.ETC,
  SOPRANO = MUSIC_MAJOR_VOCAL.SOPRANO,
  MEZZO_SOPRANO = MUSIC_MAJOR_VOCAL.MEZZO_SOPRANO,
  ALTO = MUSIC_MAJOR_VOCAL.ALTO,
  TENOR = MUSIC_MAJOR_VOCAL.TENOR,
  BARITONE = MUSIC_MAJOR_VOCAL.BARITONE,
  BASS = MUSIC_MAJOR_VOCAL.BASS,
  VIOLIN = MUSIC_MAJOR_STRING.VIOLIN,
  VIOLA = MUSIC_MAJOR_STRING.VIOLA,
  CELLO = MUSIC_MAJOR_STRING.CELLO,
  DOUBLE_BASE = MUSIC_MAJOR_STRING.DOUBLE_BASE,
  HARP = MUSIC_MAJOR_STRING.HARP,
  FLUTE = MUSIC_MAJOR_BRASS.FLUTE,
  OBOE = MUSIC_MAJOR_BRASS.OBOE,
  CLARINET = MUSIC_MAJOR_BRASS.CLARINET,
  BASSOON = MUSIC_MAJOR_BRASS.BASSOON,
  HORN = MUSIC_MAJOR_BRASS.HORN,
  TRUMPET = MUSIC_MAJOR_BRASS.TRUMPET,
  TROMBONE = MUSIC_MAJOR_BRASS.TROMBONE,
  TUBA = MUSIC_MAJOR_BRASS.TUBA,
  ELECTRIC_GUITAR = MUSIC_MAJOR_POPULAR_MUSIC.ELECTRIC_GUITAR,
  BASS_GUITAR = MUSIC_MAJOR_POPULAR_MUSIC.BASS_GUITAR,
  DRUM = MUSIC_MAJOR_POPULAR_MUSIC.DRUM,
  VOCAL = MUSIC_MAJOR_POPULAR_MUSIC.VOCAL,
  ACOUSTIC_GUITAR = MUSIC_MAJOR_POPULAR_MUSIC.ACOUSTIC_GUITAR,
  MIDI = MUSIC_MAJOR_POPULAR_MUSIC.MIDI,
  GAYAGEUM = MUSIC_MAJOR_TRADITIONAL_MUSIC.GAYAGEUM,
  GEOMUNGO = MUSIC_MAJOR_TRADITIONAL_MUSIC.GEOMUNGO,
  AJAENG = MUSIC_MAJOR_TRADITIONAL_MUSIC.AJAENG,
  HAEGEUM = MUSIC_MAJOR_TRADITIONAL_MUSIC.HAEGEUM,
  DAEGEUM = MUSIC_MAJOR_TRADITIONAL_MUSIC.DAEGEUM,
  SOGEUM = MUSIC_MAJOR_TRADITIONAL_MUSIC.SOGEUM,
  DANSO = MUSIC_MAJOR_TRADITIONAL_MUSIC.DANSO,
  PEERI = MUSIC_MAJOR_TRADITIONAL_MUSIC.PEERI,
  TAEPYEONGSO = MUSIC_MAJOR_TRADITIONAL_MUSIC.TAEPYEONGSO,
  SAMULNORI = MUSIC_MAJOR_TRADITIONAL_MUSIC.SAMULNORI,
  JANGGU = MUSIC_MAJOR_TRADITIONAL_MUSIC.JANGGU,
  PANSORI = MUSIC_MAJOR_TRADITIONAL_MUSIC.PANSORI,
  MINYO = MUSIC_MAJOR_TRADITIONAL_MUSIC.MINYO,
}

export enum MAJOR_CATEGORY {
  MUSIC_MAJOR_ETC = 'MUSIC_MAJOR_ETC',
  MUSIC_MAJOR_KEYBOARD = 'MUSIC_MAJOR_KEYBOARD',
  MUSIC_MAJOR_ADMINISTRATION = 'MUSIC_MAJOR_ADMINISTRATION',
  MUSIC_MAJOR_VOCAL = 'MUSIC_MAJOR_VOCAL',
  MUSIC_MAJOR_STRING = 'MUSIC_MAJOR_STRING',
  MUSIC_MAJOR_BRASS = 'MUSIC_MAJOR_BRASS',
  MUSIC_MAJOR_POPULAR_MUSIC = 'MUSIC_MAJOR_POPULAR_MUSIC',
  MUSIC_MAJOR_TRADITIONAL_MUSIC = 'MUSIC_MAJOR_TRADITIONAL_MUSIC',
}

@Entity('major_categories')
export class MajorCategory extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'enum', enum: MAJOR_CATEGORY, name: 'group' })
  group: MAJOR_CATEGORY;

  @Column({ type: 'varchar', name: 'ko_name' })
  koName: string;

  @Column({ type: 'varchar', name: 'en_name' })
  enName: string;

  @OneToMany(() => FullTimeJobMajorCategory, fullTimeJobMajorCategory => fullTimeJobMajorCategory.majorCategory)
  fullTimeJobMajorCategories: FullTimeJobMajorCategory[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;
}
