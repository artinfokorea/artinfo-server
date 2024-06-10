import { IMAGE_TARGET } from '@/system/entity/image.entity';

export class ImageCreator {
  userId: number;
  target: IMAGE_TARGET;
  originalFilename: string;
  groupPath: string;
  savedFilename: string;
  savedPath: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;

  constructor({
    userId,
    target,
    originalFilename,
    groupPath,
    savedFilename,
    savedPath,
    mimeType,
    width,
    height,
    size,
  }: {
    userId: number;
    target: IMAGE_TARGET;
    originalFilename: string;
    groupPath: string;
    savedFilename: string;
    savedPath: string;
    mimeType: string;
    width: number;
    height: number;
    size: number;
  }) {
    this.userId = userId;
    this.target = target;
    this.originalFilename = originalFilename;
    this.groupPath = groupPath;
    this.savedFilename = savedFilename;
    this.savedPath = savedPath;
    this.mimeType = mimeType;
    this.width = width;
    this.height = height;
    this.size = size;
  }
}
