import { JOB_TYPE } from '@/job/entity/job.entity';
import { PROVINCE_TYPE } from '@/system/entity/province';

export class JobCreator {
  userId: number;
  title: string;
  contents: string;
  companyName: string;
  province: PROVINCE_TYPE;
  imageUrl: string | null;
  address: string | null;
  fee: number | null;
  type: JOB_TYPE;

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
    type: JOB_TYPE;
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
