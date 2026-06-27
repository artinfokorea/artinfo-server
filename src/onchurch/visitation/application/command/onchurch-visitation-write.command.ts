export class OnchurchVisitationWriteCommand {
  saintId: number | null;
  saintName: string;
  minister: string;
  type: string;
  date: string;
  content: string | null;

  constructor(p: {
    saintId: number | null;
    saintName: string;
    minister: string;
    type: string;
    date: string;
    content: string | null;
  }) {
    this.saintId = p.saintId;
    this.saintName = p.saintName;
    this.minister = p.minister;
    this.type = p.type;
    this.date = p.date;
    this.content = p.content;
  }
}
