export class LessonCreator {
  userId: number;
  imageUrl: string;
  pay: number;
  introduction: string;
  career: string;

  constructor({ userId, imageUrl, pay, introduction, career }: { userId: number; imageUrl: string; pay: number; introduction: string; career: string }) {
    this.userId = userId;
    this.imageUrl = imageUrl;
    this.pay = pay;
    this.introduction = introduction;
    this.career = career;
  }
}
