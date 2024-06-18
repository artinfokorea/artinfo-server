import { SCHOOL_TYPE } from '@/user/entity/school.entity';

export class SchoolCreator {
  userId: number;
  type: SCHOOL_TYPE;
  name: string;

  constructor({ userId, type, name }: { userId: number; type: SCHOOL_TYPE; name: string }) {
    this.userId = userId;
    this.type = type;
    this.name = name;
  }
}
