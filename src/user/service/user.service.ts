import { User } from '@/user/entity/user.entity';
import { UserRepository } from '@/user/repository/user.repository';
import { Injectable } from '@nestjs/common';
import { EditUserCommand } from '@/user/dto/command/edit-user.command';
import { SchoolRepository } from '@/user/repository/school.repository';
import { DataSource } from 'typeorm';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { InvalidPhoneNumber } from '@/user/exception/user.exception';
import { EmailAuthenticationDoesNotExist } from '@/auth/exception/auth.exception';
import { UserCreator } from '@/user/repository/opertaion/user.creator';
import { AuthRepository } from '@/auth/repository/auth.repository';
import { Auth, AUTH_TYPE } from '@/auth/entity/auth.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly schoolRepository: SchoolRepository,
    private readonly redisService: RedisRepository,
    private readonly dataSource: DataSource,
    private readonly authRepository: AuthRepository,
  ) {}

  async getUserById(id: number): Promise<User> {
    return this.userRepository.findOneOrThrowById(id);
  }

  async editPassword(email: string, password: string): Promise<void> {
    const verification = await this.redisService.getByKey(email);
    if (!verification) throw new EmailAuthenticationDoesNotExist();

    await this.redisService.delete(email);

    await this.dataSource.transaction(async transactionManager => {
      await this.userRepository.editPasswordOrThrowByEmail(email, password, transactionManager);
    });
  }

  async editPhone(userId: number, phone: string): Promise<void> {
    const dashDeletedPhoneNumber = phone.replace(/-/g, '');
    const verification = await this.redisService.getByKey(dashDeletedPhoneNumber);
    if (verification !== true) {
      throw new InvalidPhoneNumber();
    }

    await this.redisService.delete(dashDeletedPhoneNumber);

    await this.dataSource.transaction(async transactionManager => {
      await this.userRepository.editPhoneOrThrow(userId, phone, transactionManager);
    });
  }

  async editUser(command: EditUserCommand): Promise<void> {
    await this.dataSource.transaction(async transactionManager => {
      await this.userRepository.editOrThrow(command.toUserEditor(), transactionManager);
      await this.schoolRepository.deleteByUserId(command.userId, transactionManager);
      await this.schoolRepository.createMany(command.toSchoolCreators(), transactionManager);
    });
  }

  async createDummyUser(nickname: string): Promise<Auth> {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const creator = new UserCreator({
      name: nickname,
      nickname: nickname,
      email: `dummy-${uniqueId}@artinfo.dummy`,
      password: null,
      iconImageUrl: null,
    });

    const userId = await this.userRepository.create(creator);
    const user = await this.userRepository.findOneOrThrowById(userId);

    return this.authRepository.create({ type: AUTH_TYPE.EMAIL, user });
  }
}
