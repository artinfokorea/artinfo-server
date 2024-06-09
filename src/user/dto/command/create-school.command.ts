import { SCHOOL_TYPE } from '@/user/entity/school.entity';

export class CreateSchoolsCommand {
  schools: {
    type: SCHOOL_TYPE;
    name: string;
  }[];

  constructor(schools: { type: SCHOOL_TYPE; name: string }[]) {
    this.schools = schools;
  }
}
