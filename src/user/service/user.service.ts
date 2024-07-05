import { User } from '@/user/entity/user.entity';
import { UserRepository } from '@/user/repository/user.repository';
import { Injectable } from '@nestjs/common';
import { EditUserCommand } from '@/user/dto/command/edit-user.command';
import { SchoolRepository } from '@/user/repository/school.repository';
import { DataSource, Repository } from 'typeorm';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { InvalidPhoneNumber } from '@/user/exception/user.exception';
import { EmailAuthenticationDoesNotExist } from '@/auth/exception/auth.exception';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import { initPasswordTemplate } from '@/aws/ses/email-templates/init-password.template';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly tempRepository: Repository<User>,
    private readonly userRepository: UserRepository, //
    private readonly schoolRepository: SchoolRepository,
    private readonly redisService: RedisRepository,
    private readonly dataSource: DataSource,
    private readonly sesService: AwsSesService,
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

  async sendInitMail() {
    const batchSize = 300;
    let offset = 0;
    let users: User[];

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    do {
      console.log(offset);
      users = await this.tempRepository.find({
        skip: offset,
        take: batchSize,
      });

      if (users.length > 0) {
        await Promise.all(
          users.map(async user => {
            await this.sesService.send([user.email], 'ARTINFO 초기화 비밀번호', initPasswordTemplate(user.tempPassword!));
          }),
        );
      }

      offset += batchSize;

      if (users.length === batchSize) {
        await sleep(3000); // 3초 대기
      }
    } while (users.length === batchSize);
  }
}
