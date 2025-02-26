export class ApplyLessonCommand {
  applicantId: number;
  teacherId: number;
  contents: string;

  constructor({ applicantId, teacherId, contents }: { applicantId: number; teacherId: number; contents: string }) {
    this.applicantId = applicantId;
    this.teacherId = teacherId;
    this.contents = contents;
  }
}
