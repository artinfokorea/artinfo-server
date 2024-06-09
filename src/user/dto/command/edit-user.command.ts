import { CreateSchoolsCommand } from '@/user/dto/command/create-school.command';
import { SCHOOL_TYPE } from '@/user/entity/school.entity';
import { UserEditor } from '@/user/repository/opertaion/user.editor';
import { SchoolCreator } from '@/user/repository/opertaion/school.creator';

export class EditUserCommand extends CreateSchoolsCommand {
  userId: number;
  phone: string | null;
  birth: Date | null;
  majorIds: number[];
  iconImageUrl: string | null;

  constructor({
    schools,
    userId,
    phone,
    birth,
    majorIds,
    iconImageUrl,
  }: {
    schools: {
      type: SCHOOL_TYPE;
      name: string;
    }[];
    userId: number;
    phone: string | null;
    birth: Date | null;
    majorIds: number[];
    iconImageUrl: string | null;
  }) {
    super(schools);
    this.userId = userId;
    this.phone = phone;
    this.birth = birth;
    this.majorIds = majorIds;
    this.iconImageUrl = iconImageUrl;
  }

  toUserEditor() {
    return new UserEditor({
      userId: this.userId,
      phone: this.phone,
      birth: this.birth,
      majorIds: this.majorIds,
      iconImageUrl: this.iconImageUrl,
    });
  }

  toSchoolCreators() {
    return this.schools.map(
      school =>
        new SchoolCreator({
          type: school.type,
          name: school.name,
        }),
    );
  }
}
