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

    // 그룹 구성원은 자동으로 인물에 나타난다 — 아직 인물로 등록되지 않은 구성원을 동기화
    const people = await this.personRepository.scanViewsByGroupId(groupId);
    const linkedMemberIds = new Set(people.map(view => view.person.memberId).filter((id): id is number => id != null));
    const memberViews = await this.memberRepository.scanViewsByGroupId(groupId, userId);
    const missing = memberViews.filter(view => !linkedMemberIds.has(view.member.id));

    if (missing.length === 0) return people;

    for (const view of missing) {
      try {
        await this.personRepository.create({
          groupId,
          name: view.member.name,
          imageUrl: view.member.avatarUrl,
          memberId: view.member.id,
        });
      } catch {
        // 동시 조회로 이미 생성된 경우 (unique index) — 무시
      }
    }

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
