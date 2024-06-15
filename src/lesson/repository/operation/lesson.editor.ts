export class LessonEditor {
  lessonId: number;
  imageUrl: string;
  pay: number;
  introduction: string;
  career: string;

  constructor({ lessonId, imageUrl, pay, introduction, career }: { lessonId: number; imageUrl: string; pay: number; introduction: string; career: string }) {
    this.lessonId = lessonId;
    this.imageUrl = imageUrl;
    this.pay = pay;
    this.introduction = introduction;
    this.career = career;
  }
}
