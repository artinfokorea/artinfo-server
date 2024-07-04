export class LessonCreator {
  userId: number;
  imageUrl: string;
  pay: number;
  introduction: string;
  career: string | null;

  constructor({ userId, imageUrl, pay, introduction, career }: { userId: number; imageUrl: string; pay: number; introduction: string; career: string | null }) {
    this.userId = userId;
    this.imageUrl = imageUrl;
    this.pay = pay;
    this.introduction = introduction;
    this.career = career;
  }
}
