import { User } from '@/user/entity/user.entity';
import { UserRepository } from '@/user/repository/user.repository';
import { Injectable } from '@nestjs/common';
import { EditUserCommand } from '@/user/dto/command/edit-user.command';
import { SchoolRepository } from '@/user/repository/school.repository';
import { DataSource } from 'typeorm';
import { RedisService } from '@/common/redis/redis.service';
import { InvalidPhoneNumber } from '@/user/exception/user.exception';

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

  async editUser(command: EditUserCommand): Promise<void> {
    if (command.phone) {
      const dashDeletedPhoneNumber = command.phone.replace(/-/g, '');
      const verification = await this.redisService.getByKey(dashDeletedPhoneNumber);
      if (verification !== true) {
        throw new InvalidPhoneNumber();
      } else {
        await this.redisService.delete(command.phone);
      }
    }

    await this.dataSource.transaction(async transactionManager => {
      await this.userRepository.editOrThrow(command.toUserEditor(), transactionManager);
      await this.schoolRepository.createMany(command.toSchoolCreators(), transactionManager);
    });
  }
}
