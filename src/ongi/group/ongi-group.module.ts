import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiGroup } from '@/ongi/group/domain/entity/ongi-group.entity';
import { OngiMember } from '@/ongi/group/domain/entity/ongi-member.entity';
import { OngiBlock } from '@/ongi/group/domain/entity/ongi-block.entity';
import { ONGI_BLOCK_REPOSITORY } from '@/ongi/group/domain/repository/ongi-block.repository.interface';
import { OngiBlockRepository } from '@/ongi/group/infrastructure/repository/ongi-block.repository';
import { ONGI_GROUP_REPOSITORY } from '@/ongi/group/domain/repository/ongi-group.repository.interface';
import { ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { OngiGroupRepository } from '@/ongi/group/infrastructure/repository/ongi-group.repository';
import { OngiMemberRepository } from '@/ongi/group/infrastructure/repository/ongi-member.repository';
import { OngiPushModule } from '@/ongi/push/ongi-push.module';
import { OngiGroupController } from '@/ongi/group/presentation/controller/ongi-group.controller';
import { OngiMemberController } from '@/ongi/group/presentation/controller/ongi-member.controller';
import {
  OngiBlockMemberUseCase,
  OngiCreateGroupUseCase,
  OngiGetGroupUseCase,
  OngiGetMemberUseCase,
  OngiJoinGroupUseCase,
  OngiLeaveGroupUseCase,
  OngiRemoveMemberUseCase,
  OngiRenameGroupUseCase,
  OngiScanMembersUseCase,
  OngiScanMyGroupsUseCase,
} from '@/ongi/group/application/usecase/ongi-group.usecase';

@Module({
  // 푸시 모듈이 구성원 저장소를 쓰므로 순환 참조 — forwardRef 로 해소
  imports: [TypeOrmModule.forFeature([OngiGroup, OngiMember, OngiBlock]), forwardRef(() => OngiPushModule)],
  controllers: [OngiGroupController, OngiMemberController],
  providers: [
    { provide: ONGI_GROUP_REPOSITORY, useClass: OngiGroupRepository },
    { provide: ONGI_MEMBER_REPOSITORY, useClass: OngiMemberRepository },
    { provide: ONGI_BLOCK_REPOSITORY, useClass: OngiBlockRepository },
    OngiScanMyGroupsUseCase,
    OngiRenameGroupUseCase,
    OngiGetGroupUseCase,
    OngiCreateGroupUseCase,
    OngiJoinGroupUseCase,
    OngiScanMembersUseCase,
    OngiGetMemberUseCase,
    OngiBlockMemberUseCase,
    OngiRemoveMemberUseCase,
    OngiLeaveGroupUseCase,
  ],
  exports: [ONGI_GROUP_REPOSITORY, ONGI_MEMBER_REPOSITORY, ONGI_BLOCK_REPOSITORY],
})
export class OngiGroupModule {}
