export class OnchurchEventWriteCommand {
  title: string;
  description: string | null;
  location: string | null;
  startAt: Date;
  endAt: Date | null;
  isAllDay: boolean;

  constructor(params: {
    title: string;
    description: string | null;
    location: string | null;
    startAt: Date;
    endAt: Date | null;
    isAllDay: boolean;
  }) {
    this.title = params.title;
    this.description = params.description;
    this.location = params.location;
    this.startAt = params.startAt;
    this.endAt = params.endAt;
    this.isAllDay = params.isAllDay;
  }
}
