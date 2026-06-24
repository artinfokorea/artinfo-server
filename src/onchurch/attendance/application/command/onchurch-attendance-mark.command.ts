export class OnchurchAttendanceMarkCommand {
  date: string;
  serviceType: string;
  saintId: number;
  present: boolean;

  constructor(p: { date: string; serviceType: string; saintId: number; present: boolean }) {
    this.date = p.date;
    this.serviceType = p.serviceType;
    this.saintId = p.saintId;
    this.present = p.present;
  }
}
