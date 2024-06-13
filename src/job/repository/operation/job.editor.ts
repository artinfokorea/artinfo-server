export class JobEditor {
  jobId: number;
  userId: number;
  title: string;
  contents: string;
  companyName: string;
  imageUrl: string | null;
  address: string | null;
  fee: number | null;

  constructor({
    jobId,
    userId,
    title,
    contents,
    companyName,
    imageUrl,
    address,
    fee,
  }: {
    jobId: number;
    userId: number;
    title: string;
    contents: string;
    companyName: string;
    imageUrl: string | null;
    address: string | null;
    fee: number | null;
  }) {
    this.jobId = jobId;
    this.userId = userId;
    this.title = title;
    this.contents = contents;
    this.companyName = companyName;
    this.imageUrl = imageUrl;
    this.address = address;
    this.fee = fee;
  }
}
