import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum USER_TYPE {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}

export interface UserCreator {
  name: string;
  email: string;
  password: string;
}

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'enum', enum: USER_TYPE, name: 'type', default: USER_TYPE.CLIENT })
  type: USER_TYPE;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'password' })
  password: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updateAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  constructor(creator: UserCreator) {
    super();
    if (creator) {
      this.name = creator.name;
      this.email = creator.email;
      this.password = creator.password;
    }
  }
}
