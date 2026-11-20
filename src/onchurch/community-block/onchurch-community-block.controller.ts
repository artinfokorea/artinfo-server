import { Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { RestApiController, RestApiDelete, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import { OnchurchCommunityBlockService } from '@/onchurch/community-block/onchurch-community-block.service';
import { OnchurchCommunityBlockRow } from '@/onchurch/community-block/onchurch-community-block.repository';

export class OnchurchCommunityBlockRequest {
  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '차단할 성도(onchurch_users.id)' })
  userId: number;
}

export class OnchurchCommunityBlockItemResponse {
  @ApiProperty({ type: Number }) userId: number;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: Date }) createdAt: Date;

  constructor(row: OnchurchCommunityBlockRow) {
    this.userId = row.userId;
    this.name = row.name;
    this.createdAt = row.createdAt;
  }
}

export class OnchurchCommunityBlockListResponse {
  @ApiProperty({ type: [OnchurchCommunityBlockItemResponse] }) blocks: OnchurchCommunityBlockItemResponse[];

  constructor(rows: OnchurchCommunityBlockRow[]) {
    this.blocks = rows.map(row => new OnchurchCommunityBlockItemResponse(row));
  }
}

@RestApiController('/onchurch/community-blocks', 'Onchurch Community')
export class OnchurchCommunityBlockController {
  constructor(private readonly blockService: OnchurchCommunityBlockService) {}

  @RestApiGet(OnchurchCommunityBlockListResponse, { path: '/me', description: '성도 - 내가 차단한 사용자 목록', auth: [USER_TYPE.CLIENT] })
  async listMine(@AuthSignature() signature: UserSignature) {
    return new OnchurchCommunityBlockListResponse(await this.blockService.list(signature.id));
  }

  @RestApiPost(OkResponse, { path: '/me', description: '성도 - 사용자 차단 (그 사용자의 교제 글·댓글이 내게 보이지 않는다)', auth: [USER_TYPE.CLIENT] })
  async block(@AuthSignature() signature: UserSignature, @Body() request: OnchurchCommunityBlockRequest) {
    await this.blockService.block(signature.id, request.userId);
    return new OkResponse();
  }

  @RestApiDelete(OkResponse, { path: '/me/:userId', description: '성도 - 사용자 차단 해제', auth: [USER_TYPE.CLIENT] })
  async unblock(@AuthSignature() signature: UserSignature, @Param('userId', ParseIntPipe) userId: number) {
    await this.blockService.unblock(signature.id, userId);
    return new OkResponse();
  }
}
