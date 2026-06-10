import { Inject, Injectable } from '@nestjs/common';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchChurchManagementForbidden } from '@/onchurch/church/domain/exception/onchurch-church.exception';

export type OnchurchChurchRole = 'owner' | 'admin' | 'member';

/**
 * 한 사용자가 "소유" 또는 "관리자"로서 관리할 수 있는 교회를 해석한다.
 * - 오너: onchurch_churches.owner_id == userId
 * - 관리자: user.churchId 가 있고 user.role === 'admin'
 * 기존 관리 usecase 들이 findByOwnerId(signature.id) 로 자기 소유 교회만 찾던 것을
 * 이 리졸버로 대체해 비소유자 관리자도 같은 교회를 관리하게 한다.
 */
@Injectable()
export class OnchurchChurchManagerResolver {
  constructor(
    @Inject(ONCHURCH_CHURCH_REPOSITORY) private readonly churchRepository: IOnchurchChurchRepository,
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
  ) {}

  /** 관리 가능한 교회. 없으면 null (호출부가 404/[] 등 결정). */
  async resolveManagedChurch(userId: number): Promise<OnchurchChurch | null> {
    const owned = await this.churchRepository.findByOwnerId(userId);
    if (owned) return owned;

    const user = await this.userRepository.findOneOrThrowById(userId);
    if (user.churchId && user.role === ONCHURCH_USER_ROLE.ADMIN) {
      return this.churchRepository.findById(user.churchId);
    }
    return null;
  }

  /** owner-key 작업(upsert/publish 등)을 위한 실제 owner_id. 관리 권한 없으면 403. */
  async resolveOwnerId(userId: number): Promise<number> {
    const church = await this.resolveManagedChurch(userId);
    if (!church) throw new OnchurchChurchManagementForbidden();
    return church.ownerId;
  }

  /** 프론트 게이팅용 등급. 교회와 무관하면 null. */
  async resolveChurchRole(userId: number): Promise<OnchurchChurchRole | null> {
    const owned = await this.churchRepository.findByOwnerId(userId);
    if (owned) return 'owner';

    const user = await this.userRepository.findOneOrThrowById(userId);
    if (!user.churchId) return null;
    return user.role === ONCHURCH_USER_ROLE.ADMIN ? 'admin' : 'member';
  }
}
