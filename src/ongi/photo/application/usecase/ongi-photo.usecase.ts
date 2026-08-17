import { Inject, Injectable } from '@nestjs/common';
import { IOngiPhotoRepository, ONGI_PHOTO_REPOSITORY, OngiPhotoView } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
import { IOngiMemberRepository, ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { IOngiAlbumRepository, ONGI_ALBUM_REPOSITORY } from '@/ongi/album/domain/repository/ongi-album.repository.interface';
import { IOngiPersonRepository, ONGI_PERSON_REPOSITORY } from '@/ongi/person/domain/repository/ongi-person.repository.interface';
import { OngiPhoto } from '@/ongi/photo/domain/entity/ongi-photo.entity';
import { OngiPhotoComment } from '@/ongi/photo/domain/entity/ongi-photo-comment.entity';
import { OngiMember } from '@/ongi/group/domain/entity/ongi-member.entity';
import { OngiUploadPhotosCommand } from '@/ongi/photo/application/command/ongi-upload-photos.command';
import { OngiNotGroupMember } from '@/ongi/group/domain/exception/ongi-group.exception';
import { OngiAlbumNotFound } from '@/ongi/album/domain/exception/ongi-album.exception';
import { OngiPersonNotFound } from '@/ongi/person/domain/exception/ongi-person.exception';
import { OngiAlbumNotInGroup, OngiPhotoNotFound, OngiUploadPhotoRequired, OngiUploadTargetRequired } from '@/ongi/photo/domain/exception/ongi-photo.exception';

@Injectable()
export class OngiPhotoAccessService {
  constructor(
    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async requireMember(groupId: number, userId: number): Promise<OngiMember> {
    const member = await this.memberRepository.findByGroupIdAndUserId(groupId, userId);
    if (!member) throw new OngiNotGroupMember();

    return member;
  }
}

@Injectable()
export class OngiScanFeedUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    private readonly accessService: OngiPhotoAccessService,
  ) {}

  async execute(userId: number, groupId: number): Promise<OngiPhotoView[]> {
    await this.accessService.requireMember(groupId, userId);

    const photos = await this.photoRepository.scanByGroupId(groupId);

    return toViews(this.photoRepository, userId, photos);
  }
}

@Injectable()
export class OngiScanAlbumPhotosUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    @Inject(ONGI_ALBUM_REPOSITORY)
    private readonly albumRepository: IOngiAlbumRepository,

    private readonly accessService: OngiPhotoAccessService,
  ) {}

  async execute(userId: number, albumId: number): Promise<OngiPhotoView[]> {
    const album = await this.albumRepository.findById(albumId);
    if (!album) throw new OngiAlbumNotFound();

    await this.accessService.requireMember(album.groupId, userId);

    const photos = await this.photoRepository.scanByAlbumId(albumId);

    return toViews(this.photoRepository, userId, photos);
  }
}

@Injectable()
export class OngiScanPersonPhotosUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    @Inject(ONGI_PERSON_REPOSITORY)
    private readonly personRepository: IOngiPersonRepository,

    private readonly accessService: OngiPhotoAccessService,
  ) {}

  async execute(userId: number, personId: number): Promise<OngiPhotoView[]> {
    const person = await this.personRepository.findById(personId);
    if (!person) throw new OngiPersonNotFound();

    await this.accessService.requireMember(person.groupId, userId);

    const photos = await this.photoRepository.scanByPersonId(person.groupId, personId);

    return toViews(this.photoRepository, userId, photos);
  }
}

@Injectable()
export class OngiGetPhotoUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    private readonly accessService: OngiPhotoAccessService,
  ) {}

  async execute(userId: number, photoId: number): Promise<OngiPhotoView> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo) throw new OngiPhotoNotFound();

    await this.accessService.requireMember(photo.groupId, userId);

    const [view] = await toViews(this.photoRepository, userId, [photo]);

    return view;
  }
}

@Injectable()
export class OngiToggleLikeUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    private readonly accessService: OngiPhotoAccessService,
  ) {}

  async execute(userId: number, photoId: number): Promise<OngiPhotoView> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo) throw new OngiPhotoNotFound();

    await this.accessService.requireMember(photo.groupId, userId);

    const likedByMe = await this.photoRepository.toggleLike(photoId, userId);
    const updated = await this.photoRepository.findById(photoId);
    if (!updated) throw new OngiPhotoNotFound();

    return { photo: updated, likedByMe };
  }
}

@Injectable()
export class OngiScanCommentsUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    private readonly accessService: OngiPhotoAccessService,
  ) {}

  async execute(userId: number, photoId: number): Promise<OngiPhotoComment[]> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo) throw new OngiPhotoNotFound();

    await this.accessService.requireMember(photo.groupId, userId);

    return this.photoRepository.scanCommentsByPhotoId(photoId);
  }
}

@Injectable()
export class OngiAddCommentUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    private readonly accessService: OngiPhotoAccessService,
  ) {}

  async execute(userId: number, photoId: number, text: string): Promise<OngiPhotoComment> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo) throw new OngiPhotoNotFound();

    // 작성자는 요청 본문이 아니라 세션에서 유도 — 사진이 속한 그룹의 내 구성원 레코드
    const me = await this.accessService.requireMember(photo.groupId, userId);

    return this.photoRepository.createComment({ photoId, authorMemberId: me.id, text });
  }
}

@Injectable()
export class OngiUploadPhotosUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    @Inject(ONGI_ALBUM_REPOSITORY)
    private readonly albumRepository: IOngiAlbumRepository,

    @Inject(ONGI_PERSON_REPOSITORY)
    private readonly personRepository: IOngiPersonRepository,

    private readonly accessService: OngiPhotoAccessService,
  ) {}

  /** 선택한 모든 그룹에 동시에 게시 — 그룹마다 독립 게시물이 생겨 좋아요·댓글이 분리됩니다 */
  async execute(userId: number, command: OngiUploadPhotosCommand): Promise<OngiPhotoView[]> {
    if (command.photos.length === 0) throw new OngiUploadPhotoRequired();
    if (command.targets.length === 0) throw new OngiUploadTargetRequired();

    const created: OngiPhoto[] = [];

    for (const target of command.targets) {
      const me = await this.accessService.requireMember(target.groupId, userId);

      if (target.albumId !== null) {
        const album = await this.albumRepository.findById(target.albumId);
        if (!album || album.groupId !== target.groupId) throw new OngiAlbumNotInGroup();
      }

      // 다른 그룹의 인물 id 가 섞여 들어오지 않도록 그룹 소속 인물만 남긴다
      const people = await this.personRepository.scanByGroupIdAndIds(target.groupId, target.personIds);
      const personIds = people.map(person => person.id);

      for (let i = 0; i < command.photos.length; i++) {
        const item = command.photos[i];
        const photo = await this.photoRepository.create({
          groupId: target.groupId,
          authorMemberId: me.id,
          albumId: target.albumId,
          url: item.url,
          aspectRatio: item.aspectRatio,
          caption: i === 0 ? command.caption : null,
          location: null,
          personIds,
        });
        created.push(photo);
      }
    }

    return created.map(photo => ({ photo, likedByMe: false }));
  }
}

async function toViews(photoRepository: IOngiPhotoRepository, userId: number, photos: OngiPhoto[]): Promise<OngiPhotoView[]> {
  const likedIds = new Set(
    await photoRepository.likedPhotoIdsOf(
      userId,
      photos.map(photo => photo.id),
    ),
  );

  return photos.map(photo => ({ photo, likedByMe: likedIds.has(photo.id) }));
}
