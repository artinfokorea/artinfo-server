import { JOB_TYPE } from '@/job/entity/job.entity';

export class JobCreator {
  userId: number;
  title: string;
  contents: string;
  companyName: string;
  recruitSiteUrl: string | null;
  imageUrl: string | null;
  address: string | null;
  addressDetail: string | null;
  fee: number | null;
  type: JOB_TYPE;

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
    type,
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
    type: JOB_TYPE;
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
    this.type = type;
  }
}
