export class EditLessonCommand {
  userId: number;
  imageUrl: string;
  pay: number;
  areaNames: string[];
  introduction: string;
  career: string;

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
    career: string;
  }) {
    this.userId = userId;
    this.imageUrl = imageUrl;
    this.pay = pay;
    this.areaNames = areaNames;
    this.introduction = introduction;
    this.career = career;
  }
}
