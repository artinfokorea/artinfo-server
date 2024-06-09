import { SCHOOL_TYPE } from '@/user/entity/school.entity';

export class SchoolCreator {
  type: SCHOOL_TYPE;
  name: string;

  constructor({ type, name }: { type: SCHOOL_TYPE; name: string }) {
    this.type = type;
    this.name = name;
  }
}
