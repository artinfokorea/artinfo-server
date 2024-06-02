import { JOB_TYPE, PROVINCE_TYPE } from '@/job/entity/job.entity';
import { JobCreator } from '@/job/repository/operation/job.creator';

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
  type: JOB_TYPE;
  startAt: Date | null;
  endAt: Date | null;

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
    startAt,
    endAt,
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
    type: JOB_TYPE;
    startAt: Date | null;
    endAt: Date | null;
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
    this.startAt = startAt;
    this.endAt = endAt;
  }

  toCreator() {
    return new JobCreator({
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
