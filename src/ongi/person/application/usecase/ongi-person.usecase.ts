import { Inject, Injectable } from '@nestjs/common';
import { IOngiPersonRepository, ONGI_PERSON_REPOSITORY, OngiPersonView } from '@/ongi/person/domain/repository/ongi-person.repository.interface';
import { IOngiMemberRepository, ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { OngiNotGroupMember } from '@/ongi/group/domain/exception/ongi-group.exception';
import { OngiPersonNotFound } from '@/ongi/person/domain/exception/ongi-person.exception';

@Injectable()
export class OngiScanPeopleUseCase {
  constructor(
    @Inject(ONGI_PERSON_REPOSITORY)
    private readonly personRepository: IOngiPersonRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async execute(userId: number, groupId: number): Promise<OngiPersonView[]> {
    const me = await this.memberRepository.findByGroupIdAndUserId(groupId, userId);
    if (!me) throw new OngiNotGroupMember();

    return this.personRepository.scanViewsByGroupId(groupId);
  }
}

@Injectable()
export class OngiCreatePersonUseCase {
  constructor(
    @Inject(ONGI_PERSON_REPOSITORY)
    private readonly personRepository: IOngiPersonRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async execute(userId: number, groupId: number, name: string, imageUrl: string | null): Promise<OngiPersonView> {
    const me = await this.memberRepository.findByGroupIdAndUserId(groupId, userId);
    if (!me) throw new OngiNotGroupMember();

    const person = await this.personRepository.create({ groupId, name, imageUrl });
    const view = await this.personRepository.getViewById(person.id);
    if (!view) throw new OngiPersonNotFound();

    return view;
  }
}
