import { RestApiController, RestApiGet } from '@/common/decorator/rest-api';
import { UserService } from '@/user/service/user.service';
import { User, USER_TYPE } from '@/user/entity/user.entity';

@RestApiController('/users', 'User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RestApiGet(User, { path: '/me', description: '내 정보 조회', auth: [USER_TYPE.CLIENT] })
  getHello(): Promise<User> {
    return this.userService.getUserById(1);
  }
}
