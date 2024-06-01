import { PROVINCE_TYPE } from '@/job/entity/full-time-job.entity';
import { FullTimeJobEditor } from '@/job/repository/operation/full-time-job.editor';

export class EditFullTimeJobCommand {
  jobId: number;
  userId: number;
  title: string;
  contents: string;
  companyName: string;
  province: PROVINCE_TYPE;
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
    province,
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
    province: PROVINCE_TYPE;
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
    this.province = province;
    this.imageUrl = imageUrl;
    this.address = address;
    this.fee = fee;
    this.majorIds = majorIds;
  }

  toEditor() {
    return new FullTimeJobEditor({
      jobId: this.jobId,
      userId: this.userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      province: this.province,
      imageUrl: this.imageUrl,
      address: this.address,
      fee: this.fee,
    });
  }
}
