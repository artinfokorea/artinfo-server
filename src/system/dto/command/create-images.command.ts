import { IMAGE_TARGET } from '@/system/entity/image.entity';
import { UploadFile } from '@/common/type/type';

export class CreateImagesCommand {
  userId: number;
  files: UploadFile[];
  target: IMAGE_TARGET;
  compress: boolean;

  constructor({ userId, files, target, compress }: { userId: number; files: UploadFile[]; target: IMAGE_TARGET; compress: boolean }) {
    this.userId = userId;
    this.files = files;
    this.target = target;
    this.compress = compress;
  }
}
