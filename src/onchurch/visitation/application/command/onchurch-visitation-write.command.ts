export class OnchurchVisitationWriteCommand {
  saintId: number | null;
  saintName: string;
  participants: string | null;
  minister: string;
  type: string;
  date: string;
  content: string | null;

  constructor(p: {
    saintId: number | null;
    saintName: string;
    participants: string | null;
    minister: string;
    type: string;
    date: string;
    content: string | null;
  }) {
    this.saintId = p.saintId;
    this.saintName = p.saintName;
    this.participants = p.participants;
    this.minister = p.minister;
    this.type = p.type;
    this.date = p.date;
    this.content = p.content;
  }
}
