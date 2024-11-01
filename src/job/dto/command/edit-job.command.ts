import { JobEditor } from '@/job/repository/operation/job.editor';

export class EditJobCommand {
  jobId: number;
  userId: number;
  title: string;
  contents: string;
  companyName: string;
  recruitSiteUrl: string | null;
  imageUrl: string | null;
  address: string | null;
  addressDetail: string | null;
  fee: number | null;
  majorIds: number[];
  schedules: { startAt: Date; endAt: Date }[];
  isActive: boolean;

  constructor({
    jobId,
    userId,
    title,
    contents,
    companyName,
    recruitSiteUrl,
    imageUrl,
    address,
    addressDetail,
    fee,
    majorIds,
    schedules,
    isActive,
  }: {
    jobId: number;
    userId: number;
    title: string;
    contents: string;
    companyName: string;
    recruitSiteUrl: string | null;
    imageUrl: string | null;
    address: string | null;
    addressDetail: string | null;
    fee: number | null;
    majorIds: number[];
    schedules: { startAt: Date; endAt: Date }[];
    isActive: boolean;
  }) {
    this.jobId = jobId;
    this.userId = userId;
    this.title = title;
    this.contents = contents;
    this.companyName = companyName;
    this.recruitSiteUrl = recruitSiteUrl;
    this.imageUrl = imageUrl;
    this.address = address;
    this.addressDetail = addressDetail;
    this.fee = fee;
    this.majorIds = majorIds;
    this.schedules = schedules;
    this.isActive = isActive;
  }

  toEditor() {
    return new JobEditor({
      jobId: this.jobId,
      userId: this.userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      recruitSiteUrl: this.recruitSiteUrl,
      imageUrl: this.imageUrl,
      address: this.address,
      addressDetail: this.addressDetail,
      fee: this.fee,
      schedules: this.schedules,
      isActive: this.isActive,
    });
  }
}
