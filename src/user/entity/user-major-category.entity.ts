import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { User } from '@/user/entity/user.entity';

@Entity('users_major_categories')
export class UserMajorCategoryEntity extends BaseEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'major_category_id' })
  majorCategoryId: number;

  @ManyToOne(() => User, user => user.userMajorCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => MajorCategory, majorCategory => majorCategory.userMajorCategories, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'major_category_id', referencedColumnName: 'id' })
  majorCategory: MajorCategory;
}
