export class ConvertedImage {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
  extension: string;
  originalFilename: string;
  pageNumber?: number;

  constructor(params: {
    buffer: Buffer;
    width: number;
    height: number;
    mimeType: string;
    extension: string;
    originalFilename: string;
    pageNumber?: number;
  }) {
    this.buffer = params.buffer;
    this.width = params.width;
    this.height = params.height;
    this.mimeType = params.mimeType;
    this.extension = params.extension;
    this.originalFilename = params.originalFilename;
    this.pageNumber = params.pageNumber;
  }
}
