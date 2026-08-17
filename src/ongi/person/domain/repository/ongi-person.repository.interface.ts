import { OngiPerson, OngiPersonCreator } from '@/ongi/person/domain/entity/ongi-person.entity';

export const ONGI_PERSON_REPOSITORY = Symbol('ONGI_PERSON_REPOSITORY');

export interface OngiPersonView {
  person: OngiPerson;
  /** 이 인물이 태그된 사진 수 */
  photoCount: number;
}

export interface IOngiPersonRepository {
  create(creator: OngiPersonCreator): Promise<OngiPerson>;
  findById(id: number): Promise<OngiPerson | null>;
  scanByGroupIdAndIds(groupId: number, ids: number[]): Promise<OngiPerson[]>;
  scanViewsByGroupId(groupId: number): Promise<OngiPersonView[]>;
  getViewById(id: number): Promise<OngiPersonView | null>;
}
