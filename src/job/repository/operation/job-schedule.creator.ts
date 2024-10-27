export class JobScheduleCreator {
  jobId: number;
  schedules: { startAt: Date; endAt: Date }[];

  constructor({ jobId, schedules }: { jobId: number; schedules: { startAt: Date; endAt: Date }[] }) {
    this.jobId = jobId;
    this.schedules = schedules;
  }
}
