import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiGroup } from '@/ongi/group/domain/entity/ongi-group.entity';
import { OngiMember } from '@/ongi/group/domain/entity/ongi-member.entity';
import { ONGI_GROUP_REPOSITORY } from '@/ongi/group/domain/repository/ongi-group.repository.interface';
import { ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { OngiGroupRepository } from '@/ongi/group/infrastructure/repository/ongi-group.repository';
import { OngiMemberRepository } from '@/ongi/group/infrastructure/repository/ongi-member.repository';
import { OngiGroupController } from '@/ongi/group/presentation/controller/ongi-group.controller';
import { OngiMemberController } from '@/ongi/group/presentation/controller/ongi-member.controller';
import {
  OngiCreateGroupUseCase,
  OngiGetGroupUseCase,
  OngiGetMemberUseCase,
  OngiJoinGroupUseCase,
  OngiScanMembersUseCase,
  OngiScanMyGroupsUseCase,
} from '@/ongi/group/application/usecase/ongi-group.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([OngiGroup, OngiMember])],
  controllers: [OngiGroupController, OngiMemberController],
  providers: [
    { provide: ONGI_GROUP_REPOSITORY, useClass: OngiGroupRepository },
    { provide: ONGI_MEMBER_REPOSITORY, useClass: OngiMemberRepository },
    OngiScanMyGroupsUseCase,
    OngiGetGroupUseCase,
    OngiCreateGroupUseCase,
    OngiJoinGroupUseCase,
    OngiScanMembersUseCase,
    OngiGetMemberUseCase,
  ],
  exports: [ONGI_GROUP_REPOSITORY, ONGI_MEMBER_REPOSITORY],
})
export class OngiGroupModule {}
