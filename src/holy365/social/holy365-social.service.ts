import { Injectable } from '@nestjs/common';
import { Holy365SocialRepository, Holy365UserCard } from '@/holy365/social/infrastructure/holy365-social.repository';
import { Holy365KakaoPlaceClient } from '@/holy365/social/infrastructure/holy365-kakao-place.client';
import { Holy365UserRepository } from '@/holy365/user/infrastructure/holy365-user.repository';
import { Holy365TranscriptionUseCase } from '@/holy365/transcription/application/holy365-transcription.usecase';
import { normalizeRegion } from '@/holy365/social/domain/holy365-church-name';
import { periodStart } from '@/holy365/community/domain/holy365-period';
import { kstDateOf } from '@/holy365/common/holy365-kst';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

export function userCardOf(card: Holy365UserCard) {
  return {
    id: String(card.id),
    name: card.name,
    iconImageUrl: card.iconImageUrl,
    church: card.churchId ? { id: String(card.churchId), name: card.churchName } : null,
    weekVerses: card.weekVerses,
    lastActiveDay: card.lastActiveDay,
  };
}

@Injectable()
export class Holy365SocialService {
  constructor(
    private readonly socialRepository: Holy365SocialRepository,
    private readonly kakaoPlaceClient: Holy365KakaoPlaceClient,
    private readonly userRepository: Holy365UserRepository,
    private readonly transcriptionUseCase: Holy365TranscriptionUseCase,
  ) {}

  async churchOf(churchId: number | null) {
    if (!churchId) return null;
    const church = await this.socialRepository.findChurch(churchId);
    return church ? { id: String(church.id), name: church.name, region: church.region, memberCount: church.memberCount } : null;
  }

  /** 프로필 — 비공개면 이름·교회·팔로우 수만 (본인은 항상 전부) */
  async profile(targetId: number, viewerId: number | null) {
    const user = await this.userRepository.findOneOrThrow(targetId);
    const isMe = viewerId === targetId;
    const visible = isMe || user.profilePublic;
    const [church, follow] = await Promise.all([this.churchOf(user.churchId), this.socialRepository.followCounts(targetId, viewerId)]);

    return {
      user: { id: String(user.id), name: user.name, iconImageUrl: user.iconImageUrl, church, joinedAt: user.createdAt },
      follow,
      isMe,
      visible,
      summary: visible ? await this.transcriptionUseCase.summary(targetId) : null,
    };
  }

  async assertVisible(targetId: number, viewerId: number | null): Promise<void> {
    const user = await this.userRepository.findOneOrThrow(targetId);
    if (viewerId !== targetId && !user.profilePublic) throw Holy365Errors.profilePrivate();
  }

  async follow(viewerId: number, targetId: number): Promise<void> {
    if (viewerId === targetId) throw Holy365Errors.cannotFollowSelf();
    await this.userRepository.findOneOrThrow(targetId);
    await this.socialRepository.follow(viewerId, targetId);
  }

  async searchChurches(query: string) {
    const [local, places] = await Promise.all([this.socialRepository.searchChurches(query.trim(), 10), this.kakaoPlaceClient.searchChurches(query.trim())]);
    const known = await this.socialRepository.churchesByPlaceIds(places.map(place => place.placeId));
    const byPlace = new Map(known.map(church => [church.kakaoPlaceId, church]));

    const registered = new Map(local.map(church => [church.id, church]));
    known.forEach(church => registered.set(church.id, church));

    return {
      /** 이미 홀리365 에 있는 교회 (교인 수 포함) */
      churches: [...registered.values()].map(church => ({
        id: String(church.id),
        name: church.name,
        region: church.region,
        address: church.address,
        memberCount: church.memberCount,
      })),
      /** 카카오 지도에서 찾은, 아직 아무도 등록하지 않은 교회 */
      places: places
        .filter(place => !byPlace.has(place.placeId))
        .map(place => ({ kakaoPlaceId: place.placeId, name: place.name, address: place.address, region: place.region })),
    };
  }

  async createChurch(userId: number, input: { kakaoPlaceId?: string; name: string; region: string; address?: string }) {
    const name = input.name.trim();
    if (!name) throw Holy365Errors.invalidChurch();

    const id = input.kakaoPlaceId
      ? await this.socialRepository.upsertKakaoChurch(
          { placeId: input.kakaoPlaceId, name, address: input.address ?? '', region: normalizeRegion(input.region) },
          userId,
        )
      : normalizeRegion(input.region)
        ? await this.socialRepository.upsertManualChurch(name, input.region, userId)
        : (() => {
            throw Holy365Errors.invalidChurch();
          })();

    return this.churchOf(id);
  }

  async churchPage(churchId: number) {
    const church = await this.socialRepository.findChurch(churchId);
    if (!church) throw Holy365Errors.churchNotFound();
    const members = await this.socialRepository.churchMembers(churchId, periodStart('month', kstDateOf(new Date())), 50);

    return {
      church: { id: String(church.id), name: church.name, region: church.region, address: church.address, memberCount: church.memberCount },
      members: members.map(member => ({ ...userCardOf(member), monthVerses: member.monthVerses })),
    };
  }

  async recommendations(userId: number, limit: number) {
    const me = await this.userRepository.findOneOrThrow(userId);
    const rows = await this.socialRepository.recommendations(userId, me.churchId, limit);

    return rows.map(row => ({ ...userCardOf(row), reason: row.reason }));
  }

  async feed(userId: number, limit: number) {
    const rows = await this.socialRepository.followingActivity(userId, kstDateOf(new Date()), limit);

    return rows.map(row => ({
      ...userCardOf(row),
      todayVerses: row.todayVerses,
      last: row.lastBook ? { versionCode: row.lastVersionCode, book: row.lastBook, chapter: row.lastChapter, at: row.lastAt } : null,
    }));
  }
}
