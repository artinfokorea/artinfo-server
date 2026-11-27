import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as sharp from 'sharp';
import { ObjectCannedACL } from '@aws-sdk/client-s3';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { UploadFile } from '@/common/type/type';
import { avatarPath, isAllowedAvatar } from '@/holy365/user/domain/service/holy365-avatar-policy';
import { Holy365UserRepository } from '@/holy365/user/infrastructure/holy365-user.repository';
import { Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';
import { normalizeDisplayName } from '@/holy365/auth/domain/service/holy365-credential-policy';
import { localeOf } from '@/holy365/auth/application/holy365-auth.usecase';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

@Injectable()
export class Holy365UserUseCase {
  constructor(
    private readonly userRepository: Holy365UserRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  /** 프로필 사진 — 400×400 WebP 로 줄여 S3(공개)에 올리고, 이전에 올린 사진은 지운다 (소셜 프로필 URL 은 keyOfUrl 이 걸러낸다) */
  async uploadAvatar(userId: number, file: UploadFile | undefined): Promise<Holy365User> {
    if (!file || !isAllowedAvatar(file.mimetype, file.size)) throw Holy365Errors.invalidAvatar();
    const previous = await this.userRepository.findOneOrThrow(userId);

    let image: Buffer;
    try {
      image = await sharp(file.buffer).rotate().resize(400, 400, { fit: 'cover' }).webp({ quality: 85 }).toBuffer();
    } catch {
      throw Holy365Errors.invalidAvatar();
    }

    const result = await this.awsS3Service.uploadStream(
      image,
      'image/webp',
      avatarPath(userId, randomBytes(6).toString('hex'), Date.now()),
      undefined,
      ObjectCannedACL.public_read,
    );
    await this.userRepository.update(userId, { iconImageUrl: result!.location });
    if (previous.iconImageUrl && previous.iconImageUrl !== result!.location)
      await this.awsS3Service.deleteByUrls([previous.iconImageUrl]).catch(() => undefined);

    return this.userRepository.findOneOrThrow(userId);
  }

  async removeAvatar(userId: number): Promise<Holy365User> {
    const previous = await this.userRepository.findOneOrThrow(userId);
    await this.userRepository.update(userId, { iconImageUrl: null });
    if (previous.iconImageUrl) await this.awsS3Service.deleteByUrls([previous.iconImageUrl]).catch(() => undefined);

    return this.userRepository.findOneOrThrow(userId);
  }

  me(userId: number): Promise<Holy365User> {
    return this.userRepository.findOneOrThrow(userId);
  }

  async update(
    userId: number,
    patch: { name?: string; locale?: string; churchId?: number | null; profilePublic?: boolean },
    churchExists: (id: number) => Promise<boolean>,
  ): Promise<Holy365User> {
    const changes: { name?: string; locale?: string; churchId?: number | null; profilePublic?: boolean } = {};
    if (patch.name !== undefined) {
      const name = normalizeDisplayName(patch.name);
      if (!name) throw Holy365Errors.invalidName();
      changes.name = name;
    }
    if (patch.locale !== undefined) changes.locale = localeOf(patch.locale);
    if (patch.churchId !== undefined) {
      if (patch.churchId !== null && !(await churchExists(patch.churchId))) throw Holy365Errors.churchNotFound();
      changes.churchId = patch.churchId;
    }
    if (patch.profilePublic !== undefined) changes.profilePublic = patch.profilePublic;

    await this.userRepository.findOneOrThrow(userId);
    if (Object.keys(changes).length) await this.userRepository.update(userId, changes);

    return this.userRepository.findOneOrThrow(userId);
  }

  async withdraw(userId: number): Promise<void> {
    await this.userRepository.findOneOrThrow(userId);
    await this.userRepository.withdraw(userId);
  }
}
