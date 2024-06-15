export class LessonAreaCreator {
  lessonId: number;
  names: string[];

  constructor({ lessonId, names }: { lessonId: number; names: string[] }) {
    this.lessonId = lessonId;
    this.names = names;
  }
}
