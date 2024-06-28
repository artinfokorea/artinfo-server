import { User } from '@/user/entity/user.entity';
import { UserRepository } from '@/user/repository/user.repository';
import { Injectable } from '@nestjs/common';
import { EditUserCommand } from '@/user/dto/command/edit-user.command';
import { SchoolRepository } from '@/user/repository/school.repository';
import { DataSource } from 'typeorm';
import { RedisService } from '@/common/redis/redis.service';
import { InvalidPhoneNumber } from '@/user/exception/user.exception';
import { EmailAuthenticationDoesNotExist } from '@/auth/exception/auth.exception';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository, //
    private readonly schoolRepository: SchoolRepository,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
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
}
