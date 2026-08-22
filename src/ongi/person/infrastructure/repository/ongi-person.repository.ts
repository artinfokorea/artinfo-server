import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IOngiPersonRepository, OngiPersonView } from '@/ongi/person/domain/repository/ongi-person.repository.interface';
import { OngiPerson, OngiPersonCreator } from '@/ongi/person/domain/entity/ongi-person.entity';

@Injectable()
export class OngiPersonRepository implements IOngiPersonRepository {
  constructor(
    @InjectRepository(OngiPerson)
    private readonly personRepository: Repository<OngiPerson>,
  ) {}

  async create(creator: OngiPersonCreator): Promise<OngiPerson> {
    return this.personRepository.save({
      groupId: creator.groupId,
      name: creator.name,
      imageUrl: creator.imageUrl,
      memberId: creator.memberId ?? null,
    });
  }

  async findById(id: number): Promise<OngiPerson | null> {
    return this.personRepository.findOneBy({ id });
  }

  async scanByGroupIdAndIds(groupId: number, ids: number[]): Promise<OngiPerson[]> {
    if (ids.length === 0) return [];

    return this.personRepository.find({ where: { groupId, id: In(ids) } });
  }

  async scanViewsByGroupId(groupId: number): Promise<OngiPersonView[]> {
    const people = await this.personRepository.find({ where: { groupId }, order: { id: 'ASC' } });

    return this.toViews(people);
  }

  async getViewById(id: number): Promise<OngiPersonView | null> {
    const person = await this.findById(id);
    if (!person) return null;

    const [view] = await this.toViews([person]);

    return view ?? null;
  }

  private async toViews(people: OngiPerson[]): Promise<OngiPersonView[]> {
    if (people.length === 0) return [];

    // person_ids(jsonb 배열) 를 풀어서 인물별 태그된 사진 수를 집계
    const countRows: { pid: string; count: string }[] = await this.personRepository.manager.query(
      `SELECT pid, COUNT(*) AS count
         FROM (SELECT jsonb_array_elements_text(person_ids) AS pid FROM ongi_photos WHERE group_id = ANY($1) AND deleted_at IS NULL) t
        WHERE pid = ANY($2)
        GROUP BY pid`,
      [people.map(person => person.groupId), people.map(person => String(person.id))],
    );
    const photoCounts = new Map(countRows.map(row => [Number(row.pid), Number(row.count)]));

    return people.map(person => ({
      person,
      photoCount: photoCounts.get(person.id) ?? 0,
    }));
  }
}
