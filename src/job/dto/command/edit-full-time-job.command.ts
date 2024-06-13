import { JobEditor } from '@/job/repository/operation/job.editor';

export class EditFullTimeJobCommand {
  jobId: number;
  userId: number;
  title: string;
  contents: string;
  companyName: string;
  imageUrl: string | null;
  address: string | null;
  fee: number | null;
  majorIds: number[];

  constructor({
    jobId,
    userId,
    title,
    contents,
    companyName,
    imageUrl,
    address,
    fee,
    majorIds,
  }: {
    jobId: number;
    userId: number;
    title: string;
    contents: string;
    companyName: string;
    imageUrl: string | null;
    address: string | null;
    fee: number | null;
    majorIds: number[];
  }) {
    this.jobId = jobId;
    this.userId = userId;
    this.title = title;
    this.contents = contents;
    this.companyName = companyName;
    this.imageUrl = imageUrl;
    this.address = address;
    this.fee = fee;
    this.majorIds = majorIds;
  }

  toEditor() {
    return new JobEditor({
      jobId: this.jobId,
      userId: this.userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      imageUrl: this.imageUrl,
      address: this.address,
      fee: this.fee,
    });
  }
}
