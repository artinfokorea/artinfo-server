import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Province } from '@/lesson/entity/province.entity';
import { User } from '@/user/entity/user.entity';

@Entity('lessons')
export class Lesson extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'pay' })
  pay: number;

  @Column({ type: 'varchar', name: 'introduction' })
  introduction: string;

  @Column({ type: 'varchar', name: 'career', nullable: true })
  career: string | null;

  @Column({ type: 'varchar', name: 'image_url' })
  imageUrl: string;

  @OneToOne(() => User, user => user.lesson)
  user: User;

  @OneToMany(() => Province, province => province.lesson)
  provinces: Province[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;
}
