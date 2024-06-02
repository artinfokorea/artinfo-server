import { User } from '@/user/entity/user.entity';
import { UserRepository } from '@/user/repository/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository, //
  ) {}

  async getUserById(id: number): Promise<User> {
    return this.userRepository.findOneOrThrowById(id);
  }
}
