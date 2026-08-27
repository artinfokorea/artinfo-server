import { Inject, Injectable } from '@nestjs/common';
import { IOngiUserRepository, ONGI_USER_REPOSITORY, OngiProfileStats } from '@/ongi/user/domain/repository/ongi-user.repository.interface';
import { OngiUser } from '@/ongi/user/domain/entity/ongi-user.entity';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { IOngiPushTokenRepository, ONGI_PUSH_TOKEN_REPOSITORY } from '@/ongi/push/domain/repository/ongi-push-token.repository.interface';
import { ObjectCannedACL } from '@aws-sdk/client-s3';
import { UploadFile } from '@/common/type/type';
import { Util } from '@/common/util/util';

export interface OngiStorageInfo {
  usedGb: number;
  totalGb: number;
}

@Injectable()
export class OngiGetMeUseCase {
  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,
  ) {}

  async execute(userId: number): Promise<OngiUser> {
    return this.userRepository.findOneOrThrowById(userId);
  }
}

@Injectable()
export class OngiGetMyStatsUseCase {
  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,
  ) {}

  async execute(userId: number): Promise<OngiProfileStats> {
    return this.userRepository.getProfileStats(userId);
  }
}

@Injectable()
export class OngiGetMyStorageUseCase {
  /** 사진 원본을 아직 자체 스토리지에 보관하지 않으므로 사진 1장당 5MB로 추정 계산 */
  private ESTIMATED_MB_PER_PHOTO = 5;
  private TOTAL_GB = 15;

  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,
  ) {}

  async execute(userId: number): Promise<OngiStorageInfo> {
    const stats = await this.userRepository.getProfileStats(userId);
    const usedGb = Math.round((stats.photoCount * this.ESTIMATED_MB_PER_PHOTO * 10) / 1024) / 10;

    return { usedGb, totalGb: this.TOTAL_GB };
  }
}

@Injectable()
export class OngiDeleteAccountUseCase {
  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,

    @Inject(ONGI_PUSH_TOKEN_REPOSITORY)
    private readonly pushTokenRepository: IOngiPushTokenRepository,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  /** 회원 탈퇴 — DB 삭제(익명화·cascade) 후 프로필 이미지와 올린 사진 원본을 S3 에서 지운다 (개인정보처리방침 4항) */
  async execute(userId: number): Promise<void> {
    await this.userRepository.findOneOrThrowById(userId);
    const fileUrls = await this.userRepository.softDeleteById(userId);
    await this.pushTokenRepository.deleteByUserId(userId);
    await this.awsS3Service.deleteByUrls(fileUrls);
  }
}

@Injectable()
export class OngiUpdateMeUseCase {
  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,
  ) {}

  /** 이름 변경 — 구성원·자동 생성 인물에도 전파된다 */
  async execute(userId: number, name: string): Promise<OngiUser> {
    await this.userRepository.updateProfile(userId, { name });

    return this.userRepository.findOneOrThrowById(userId);
  }
}

@Injectable()
export class OngiUploadAvatarUseCase {
  constructor(
    @Inject(ONGI_USER_REPOSITORY)
    private readonly userRepository: IOngiUserRepository,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  /** 프로필 이미지 업로드 — S3 에 올리고 사용자·구성원·인물 이미지를 갱신한다 */
  async execute(userId: number, file: UploadFile): Promise<OngiUser> {
    const extension = file.originalname.includes('.') ? file.originalname.split('.').pop()!.toLowerCase() : 'jpg';
    const filename = new Util().generateRandomString(11) + '.' + Date.now() + '.' + extension;
    const path = ['ongi', 'avatars', userId, filename].join('/');

    const previous = await this.userRepository.findOneOrThrowById(userId);
    const result = await this.awsS3Service.uploadStream(file.buffer, file.mimetype || 'image/jpeg', path, undefined, ObjectCannedACL.private);
    await this.userRepository.updateProfile(userId, { iconImageUrl: result!.location });

    // 이전 프로필 이미지는 더 이상 참조되지 않으므로 정리 (소셜 프로필 등 외부 URL 은 keyOfUrl 이 걸러낸다)
    if (previous.iconImageUrl && previous.iconImageUrl !== result!.location) {
      await this.awsS3Service.deleteByUrls([previous.iconImageUrl]);
    }

    return this.userRepository.findOneOrThrowById(userId);
  }
}
