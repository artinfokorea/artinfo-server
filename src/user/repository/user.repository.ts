import { User } from '@/user/entity/user.entity';
import { UserNotFound } from '@/user/exception/user.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserEditor } from '@/user/repository/opertaion/user.editor';
import { UserMajorCategory } from '@/user/entity/user-major-category.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneOrThrowById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new UserNotFound();

    return user;
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email: email });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async editPhoneOrThrow(userId: number, phone: string, transactionManager: EntityManager): Promise<void> {
    const user = await transactionManager.findOne(User, { where: { id: userId } });
    if (!user) throw new UserNotFound();

    await transactionManager.update(User, userId, {
      phone: phone,
    });
  }

  async editOrThrow(editor: UserEditor, transactionManager: EntityManager): Promise<void> {
    const user = await transactionManager.findOne(User, { where: { id: editor.userId } });
    if (!user) throw new UserNotFound();

    await transactionManager.update(User, editor.userId, {
      birth: editor.birth,
      iconImageUrl: editor.iconImageUrl,
    });

    await transactionManager.delete(UserMajorCategory, { userId: user.id });

    await transactionManager.save(
      UserMajorCategory,
      editor.majorIds.map(majorId => ({
        majorCategoryId: majorId,
        userId: user.id,
      })),
    );
  }
}
