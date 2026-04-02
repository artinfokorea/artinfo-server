import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AzeyoS3Service } from '@/azeyo/common/azeyo-s3.service';
import { UploadFile } from '@/common/type/type';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AzeyoUploadProfileImageUseCase {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY) private readonly userRepository: IAzeyoUserRepository,
    private readonly s3Service: AzeyoS3Service,
  ) {}

  async execute(userId: number, file: UploadFile): Promise<string> {
    const now = new Date();
    const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const key = `azeyo/profiles/${datePath}/${uuid()}.${ext}`;

    const result = await this.s3Service.uploadStream(file.buffer, file.mimetype, key);
    if (!result) throw new Error('Failed to upload image');

    const user = await this.userRepository.findOneOrThrowById(userId);
    user.iconImageUrl = result.location;
    await this.userRepository.saveEntity(user);

    return result.location;
  }
}
