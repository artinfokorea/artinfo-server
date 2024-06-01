import { FULL_TIME_JOB_TYPE, PROVINCE_TYPE } from '@/job/entity/full-time-job.entity';
import { FullTimeJobCreator } from '@/job/repository/operation/full-time-job.creator';

export class CreateFullTimeJobCommand {
  userId: number;
  title: string;
  contents: string;
  companyName: string;
  province: PROVINCE_TYPE;
  imageUrl: string | null;
  address: string | null;
  fee: number | null;
  majorIds: number[];
  type: FULL_TIME_JOB_TYPE;

  constructor({
    userId,
    title,
    contents,
    companyName,
    province,
    imageUrl,
    address,
    fee,
    majorIds,
    type,
  }: {
    userId: number;
    title: string;
    contents: string;
    companyName: string;
    province: PROVINCE_TYPE;
    imageUrl: string | null;
    address: string | null;
    fee: number | null;
    majorIds: number[];
    type: FULL_TIME_JOB_TYPE;
  }) {
    this.userId = userId;
    this.title = title;
    this.contents = contents;
    this.companyName = companyName;
    this.province = province;
    this.imageUrl = imageUrl;
    this.address = address;
    this.fee = fee;
    this.majorIds = majorIds;
    this.type = type;
  }

  toCreator() {
    return new FullTimeJobCreator({
      userId: this.userId,
      title: this.title,
      contents: this.contents,
      companyName: this.companyName,
      province: this.province,
      imageUrl: this.imageUrl,
      address: this.address,
      fee: this.fee,
      type: this.type,
    });
  }
}
