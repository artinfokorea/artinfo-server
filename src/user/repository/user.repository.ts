import { User, USER_TYPE } from '@/user/entity/user.entity';
import { UnableToDeleteMajor, UserNotFound } from '@/user/exception/user.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserEditor } from '@/user/repository/opertaion/user.editor';
import { UserMajorCategory } from '@/user/entity/user-major-category.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { MajorNotFound } from '@/major/major.exception';
import * as bcrypt from 'bcrypt';
import { UserCreator } from '@/user/repository/opertaion/user.creator';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAdminOrThrow() {
    const user = await this.userRepository.findOneBy({ type: USER_TYPE.ADMIN, email: 'artinfokorea2022@gmail.com' });
    if (!user) throw new UserNotFound();

    return user;
  }

  async create(creator: UserCreator): Promise<number> {
    let hashedPassword: string | null = null;
    if (creator.password) hashedPassword = await this.getHashedPassword(creator.password);

    const user = await this.userRepository.save({
      name: creator.name,
      nickname: creator.nickname,
      email: creator.email,
      password: hashedPassword,
      iconImageUrl: creator.iconImageUrl,
    });

    return user.id;
  }

  async findOneOrThrowById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new UserNotFound();

    return user;
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email: email });
  }

  async findOneOrThrowByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email: email });
    if (!user) throw new UserNotFound();

    return user;
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  /**
   * 회원탈퇴 — 개인정보를 익명화한 뒤 soft delete 한다.
   * 이메일은 unique 라 바꿔 두어야 같은 이메일로 다시 가입할 수 있다. 글·댓글은 "탈퇴회원" 으로 남는다.
   */
  async withdrawOrThrow(userId: number, transactionManager: EntityManager): Promise<void> {
    const user = await transactionManager.findOne(User, { where: { id: userId } });
    if (!user) throw new UserNotFound();

    await transactionManager.update(
      User,
      { id: userId },
      {
        name: '탈퇴회원',
        nickname: '탈퇴회원',
        email: `withdrawn-${userId}-${Date.now()}@withdrawn.artinfokorea.com`,
        phone: null,
        birth: null,
        password: null,
        iconImageUrl: null,
      },
    );
    await transactionManager.softDelete(User, { id: userId });
  }

  async editPasswordOrThrowByEmail(email: string, password: string, transactionManager: EntityManager): Promise<void> {
    const user = await transactionManager.findOne(User, { where: { email: email } });
    if (!user) throw new UserNotFound();

    const hashedPassword = await this.getHashedPassword(password);

    await transactionManager.update(
      User,
      { email: email },
      {
        password: hashedPassword,
      },
    );
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
    if (user.lesson && !editor.majorIds.length) throw new UnableToDeleteMajor();

    await transactionManager.update(User, editor.userId, {
      name: editor.name,
      nickname: editor.nickname,
      birth: editor.birth,
      iconImageUrl: editor.iconImageUrl,
    });

    const majors = await transactionManager.findBy(MajorCategory, { id: In(editor.majorIds) });
    if (majors.length !== editor.majorIds.length) throw new MajorNotFound();

    await transactionManager.delete(UserMajorCategory, { userId: user.id });

    await transactionManager.save(
      UserMajorCategory,
      editor.majorIds.map(majorId => ({
        majorCategoryId: majorId,
        userId: user.id,
      })),
    );
  }

  private getHashedPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
  };
}
