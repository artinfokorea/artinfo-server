import { FULL_TIME_JOB_TYPE, PROVINCE_TYPE } from '@/job/entity/full-time-job.entity';

export class FullTimeJobCreator {
  userId: number;
  title: string;
  contents: string;
  companyName: string;
  province: PROVINCE_TYPE;
  imageUrl: string | null;
  address: string | null;
  fee: number | null;
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
    this.type = type;
  }
}
