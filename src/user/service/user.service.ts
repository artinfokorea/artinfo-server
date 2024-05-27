import { UserRepository } from '@/user/repository/user.repository';
import { User } from '@/user/entity/user.entity';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository, //
  ) {}

  async getUserById(id: number): Promise<User> {
    return this.userRepository.findOrThrowById(id);
  }
}
