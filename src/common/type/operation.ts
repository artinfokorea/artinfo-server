export class PagingOperation {
  skip: number;
  take: number;

  constructor({ page, size }: { page: number; size: number }) {
    this.skip = (page - 1) * size;
    this.take = size;
  }
}
