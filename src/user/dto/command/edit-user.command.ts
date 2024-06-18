import { CreateSchoolsCommand } from '@/user/dto/command/create-school.command';
import { SCHOOL_TYPE } from '@/user/entity/school.entity';
import { UserEditor } from '@/user/repository/opertaion/user.editor';
import { SchoolCreator } from '@/user/repository/opertaion/school.creator';

export class EditUserCommand extends CreateSchoolsCommand {
  userId: number;
  birth: Date | null;
  majorIds: number[];
  iconImageUrl: string | null;

  constructor({
    schools,
    userId,
    birth,
    majorIds,
    iconImageUrl,
  }: {
    schools: {
      type: SCHOOL_TYPE;
      name: string;
    }[];
    userId: number;
    birth: Date | null;
    majorIds: number[];
    iconImageUrl: string | null;
  }) {
    super(schools);
    this.userId = userId;
    this.birth = birth;
    this.majorIds = majorIds;
    this.iconImageUrl = iconImageUrl;
  }

  toUserEditor() {
    return new UserEditor({
      userId: this.userId,
      birth: this.birth,
      majorIds: this.majorIds,
      iconImageUrl: this.iconImageUrl,
    });
  }

  toSchoolCreators() {
    return this.schools.map(
      school =>
        new SchoolCreator({
          userId: this.userId,
          type: school.type,
          name: school.name,
        }),
    );
  }
}
