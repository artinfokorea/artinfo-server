import { JOB_TYPE } from '@/job/entity/job.entity';
import { JobCreator } from '@/job/repository/operation/job.creator';

export class CreatePartTimeJobCommand {
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
  type: JOB_TYPE;
  schedules: { startAt: Date; endAt: Date }[];

  constructor({
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
    type,
    schedules,
  }: {
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
    type: JOB_TYPE;
    schedules: { startAt: Date; endAt: Date }[];
  }) {
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
    this.type = type;
    this.schedules = schedules;
  }

  toCreator() {
    return new JobCreator({
      userId: this.userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      recruitSiteUrl: this.recruitSiteUrl,
      imageUrl: this.imageUrl,
      address: this.address,
      addressDetail: this.addressDetail,
      fee: this.fee,
      type: this.type,
      schedules: this.schedules,
    });
  }
}
