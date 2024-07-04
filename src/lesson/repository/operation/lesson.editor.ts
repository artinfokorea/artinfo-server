export class LessonEditor {
  lessonId: number;
  imageUrl: string;
  pay: number;
  introduction: string;
  career: string | null;

  constructor({
    lessonId,
    imageUrl,
    pay,
    introduction,
    career,
  }: {
    lessonId: number;
    imageUrl: string;
    pay: number;
    introduction: string;
    career: string | null;
  }) {
    this.lessonId = lessonId;
    this.imageUrl = imageUrl;
    this.pay = pay;
    this.introduction = introduction;
    this.career = career;
  }
}
