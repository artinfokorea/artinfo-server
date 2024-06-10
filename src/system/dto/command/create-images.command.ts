import { IMAGE_TARGET } from '@/system/entity/image.entity';
import { UploadFile } from '@/common/type/type';

export class CreateImagesCommand {
  userId: number;
  files: UploadFile[];
  target: IMAGE_TARGET;

  constructor({ userId, files, target }: { userId: number; files: UploadFile[]; target: IMAGE_TARGET }) {
    this.userId = userId;
    this.files = files;
    this.target = target;
  }
}
