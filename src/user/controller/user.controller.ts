import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { UserService } from '@/user/service/user.service';
import { USER_TYPE } from '@/user/entity/user.entity';
import { Signature } from '@/common/decorator/signature';
import { UserSignature } from '@/common/type/type';
import { UserResponse } from '@/user/dto/response/user.response';
import { OkResponse } from '@/common/response/ok.response';
import { Body } from '@nestjs/common';
import { EditUserRequest } from '@/user/dto/request/edit-user.request';

@RestApiController('/users', 'User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RestApiGet(UserResponse, { path: '/me', description: '내 정보 조회', auth: [USER_TYPE.CLIENT] })
  async getMe(@Signature() signature: UserSignature): Promise<UserResponse> {
    const user = await this.userService.getUserById(signature.id);

    return new UserResponse(user);
  }

  @RestApiPut(OkResponse, { path: '/me', description: '내 정보 수정', auth: [USER_TYPE.CLIENT] })
  async editMe(@Signature() signature: UserSignature, @Body() request: EditUserRequest) {
    await this.userService.editUser(request.toEditUserCommand(signature.id));

    return new OkResponse();
  }
}
