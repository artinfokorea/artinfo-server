export class JobEditor {
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
    this.schedules = schedules;
    this.isActive = isActive;
  }
}
