export class CreateLessonCommand {
  userId: number;
  imageUrl: string;
  pay: number;
  areaNames: string[];
  introduction: string;
  career: string | null;

  constructor({
    userId,
    imageUrl,
    pay,
    areaNames,
    introduction,
    career,
  }: {
    userId: number;
    imageUrl: string;
    pay: number;
    areaNames: string[];
    introduction: string;
    career: string | null;
  }) {
    this.userId = userId;
    this.imageUrl = imageUrl;
    this.pay = pay;
    this.areaNames = areaNames;
    this.introduction = introduction;
    this.career = career;
  }
}
