import { Inject, Injectable } from '@nestjs/common';
import { IOngiPhotoRepository, ONGI_PHOTO_REPOSITORY, OngiPhotoView } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
import { IOngiMemberRepository, ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { IOngiBlockRepository, ONGI_BLOCK_REPOSITORY } from '@/ongi/group/domain/repository/ongi-block.repository.interface';
import { IOngiAlbumRepository, ONGI_ALBUM_REPOSITORY } from '@/ongi/album/domain/repository/ongi-album.repository.interface';
import { IOngiPersonRepository, ONGI_PERSON_REPOSITORY } from '@/ongi/person/domain/repository/ongi-person.repository.interface';
import { OngiPhoto } from '@/ongi/photo/domain/entity/ongi-photo.entity';
import { OngiPhotoComment } from '@/ongi/photo/domain/entity/ongi-photo-comment.entity';
import { ONGI_MEMBER_ROLE, OngiMember } from '@/ongi/group/domain/entity/ongi-member.entity';
import { OngiUploadPhotosCommand } from '@/ongi/photo/application/command/ongi-upload-photos.command';
import { OngiNotGroupMember } from '@/ongi/group/domain/exception/ongi-group.exception';
import { OngiAlbumNotFound } from '@/ongi/album/domain/exception/ongi-album.exception';
import { OngiPersonNotFound } from '@/ongi/person/domain/exception/ongi-person.exception';
import {
  OngiAlbumNotInGroup,
  OngiCommentDeleteForbidden,
  OngiCommentNotFound,
  OngiPhotoDeleteForbidden,
  OngiPhotoNotFound,
  OngiUploadPhotoRequired,
  OngiUploadTargetRequired,
} from '@/ongi/photo/domain/exception/ongi-photo.exception';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { ObjectCannedACL } from '@aws-sdk/client-s3';
import { UploadFile } from '@/common/type/type';
import { Util } from '@/common/util/util';
import * as moment from 'moment/moment';

/** 사진 파일 업로드 결과 — 게시(POST /ongi/photos) 전에 앱이 URL 을 받아간다 */
export interface OngiUploadedPhotoFileView {
  url: string;
}

@Injectable()
export class OngiPhotoAccessService {
  constructor(
    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,

    @Inject(ONGI_BLOCK_REPOSITORY)
    private readonly blockRepository: IOngiBlockRepository,

    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,
  ) {}

  async requireMember(groupId: number, userId: number): Promise<OngiMember> {
    const member = await this.memberRepository.findByGroupIdAndUserId(groupId, userId);
    if (!member) throw new OngiNotGroupMember();

    return member;
  }

  /** 내가 차단한 사용자들의 구성원 id — 이 작성자의 사진·댓글은 나에게 숨긴다. 내 콘텐츠는 절대 숨기지 않는다 */
  async blockedMemberIdsOf(userId: number): Promise<Set<number>> {
    const blockedUserIds = (await this.blockRepository.blockedUserIdsOf(userId)).filter(id => id !== userId);
    if (blockedUserIds.length === 0) return new Set();

    return new Set(await this.photoRepository.memberIdsOfUsers(blockedUserIds));
  }

  /** 차단한 사용자가 쓴 항목 제거 */
  async withoutBlocked<T extends { authorMemberId: number }>(userId: number, items: T[]): Promise<T[]> {
    if (items.length === 0) return items;
    const blocked = await this.blockedMemberIdsOf(userId);
    if (blocked.size === 0) return items;

    return items.filter(item => !blocked.has(item.authorMemberId));
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

    const photos = await this.accessService.withoutBlocked(userId, await this.photoRepository.scanByGroupId(groupId));

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

    const photos = await this.accessService.withoutBlocked(userId, await this.photoRepository.scanByAlbumId(albumId));

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

    const photos = await this.accessService.withoutBlocked(userId, await this.photoRepository.scanByPersonId(person.groupId, personId));

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

    return this.accessService.withoutBlocked(userId, await this.photoRepository.scanCommentsByPhotoId(photoId));
  }
}

@Injectable()
export class OngiDeletePhotoUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    private readonly accessService: OngiPhotoAccessService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  /** 사진 삭제 — 작성자 본인 또는 그룹 관리자. 달린 댓글도 함께 삭제하고, 다른 사진이 쓰지 않는 파일이면 S3 원본도 지운다 */
  async execute(userId: number, photoId: number): Promise<void> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo) throw new OngiPhotoNotFound();

    const me = await this.accessService.requireMember(photo.groupId, userId);
    const allowed = photo.authorMemberId === me.id || me.role === ONGI_MEMBER_ROLE.ADMIN;
    if (!allowed) throw new OngiPhotoDeleteForbidden();

    await this.photoRepository.softDeletePhoto(photoId);

    if ((await this.photoRepository.countActiveByUrl(photo.url)) === 0) {
      await this.awsS3Service.deleteByUrls([photo.url]);
    }
  }
}

@Injectable()
export class OngiCopyPhotosUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,

    @Inject(ONGI_ALBUM_REPOSITORY)
    private readonly albumRepository: IOngiAlbumRepository,
  ) {}

  /**
   * 다른 가족 공간에 사진 공유(복사) — 대상 공간에 독립 게시물을 만든다 (파일은 공유, 좋아요·댓글은 분리).
   * 원본 사진은 작성자 본인 또는 관리자만, 대상 공간은 내가 구성원이어야 하며 앨범은 대상 공간 소속이어야 한다.
   */
  async execute(
    userId: number,
    photoIds: number[],
    targetGroupId: number,
    albumId: number | null,
  ): Promise<{ copiedIds: number[]; skippedIds: number[] }> {
    const target = await this.memberRepository.findByGroupIdAndUserId(targetGroupId, userId);
    if (!target) throw new OngiNotGroupMember();

    if (albumId !== null) {
      const album = await this.albumRepository.findById(albumId);
      if (!album || album.groupId !== targetGroupId) throw new OngiAlbumNotInGroup();
    }

    const copiedIds: number[] = [];
    const skippedIds: number[] = [];
    const memberByGroup = new Map<number, OngiMember | null>();

    for (const photoId of photoIds) {
      const photo = await this.photoRepository.findById(photoId);
      if (!photo || photo.groupId === targetGroupId) {
        skippedIds.push(photoId);
        continue;
      }
      if (!memberByGroup.has(photo.groupId)) {
        memberByGroup.set(photo.groupId, await this.memberRepository.findByGroupIdAndUserId(photo.groupId, userId));
      }
      const me = memberByGroup.get(photo.groupId);
      const allowed = !!me && (photo.authorMemberId === me.id || me.role === ONGI_MEMBER_ROLE.ADMIN);
      if (!allowed) {
        skippedIds.push(photoId);
        continue;
      }

      await this.photoRepository.create({
        groupId: targetGroupId,
        authorMemberId: target.id,
        albumId,
        url: photo.url,
        aspectRatio: photo.aspectRatio,
        caption: photo.caption,
        location: photo.location,
        personIds: [],
      });
      copiedIds.push(photoId);
    }

    return { copiedIds, skippedIds };
  }
}

@Injectable()
export class OngiMovePhotosUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,

    @Inject(ONGI_ALBUM_REPOSITORY)
    private readonly albumRepository: IOngiAlbumRepository,
  ) {}

  /** 사진 일괄 앨범 이동 — 작성자 본인 또는 관리자인 사진만, 대상 앨범과 같은 그룹인 사진만 옮긴다. 나머지는 건너뛴다 */
  async execute(userId: number, photoIds: number[], albumId: number | null): Promise<{ movedIds: number[]; skippedIds: number[] }> {
    const album = albumId === null ? null : await this.albumRepository.findById(albumId);
    if (albumId !== null && !album) throw new OngiAlbumNotFound();

    const movedIds: number[] = [];
    const skippedIds: number[] = [];
    const memberByGroup = new Map<number, OngiMember | null>();

    for (const photoId of photoIds) {
      const photo = await this.photoRepository.findById(photoId);
      if (!photo || (album && album.groupId !== photo.groupId)) {
        skippedIds.push(photoId);
        continue;
      }
      if (!memberByGroup.has(photo.groupId)) {
        memberByGroup.set(photo.groupId, await this.memberRepository.findByGroupIdAndUserId(photo.groupId, userId));
      }
      const me = memberByGroup.get(photo.groupId);
      const allowed = !!me && (photo.authorMemberId === me.id || me.role === ONGI_MEMBER_ROLE.ADMIN);
      if (!allowed) {
        skippedIds.push(photoId);
        continue;
      }
      movedIds.push(photoId);
    }

    await this.photoRepository.moveToAlbum(movedIds, albumId);

    return { movedIds, skippedIds };
  }
}

@Injectable()
export class OngiDeletePhotosUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  /**
   * 사진 일괄 삭제 — 사진마다 작성자 본인 또는 그룹 관리자인지 확인하고, 권한 없는 것은 건너뛴다 (전체 실패 대신 부분 성공).
   * 댓글도 함께 삭제하고, 다른 사진이 쓰지 않는 파일은 S3 원본도 지운다.
   */
  async execute(userId: number, photoIds: number[]): Promise<{ deletedIds: number[]; skippedIds: number[] }> {
    const deletedIds: number[] = [];
    const skippedIds: number[] = [];
    const memberByGroup = new Map<number, OngiMember | null>();
    const urlsToCheck = new Set<string>();

    for (const photoId of photoIds) {
      const photo = await this.photoRepository.findById(photoId);
      if (!photo) {
        skippedIds.push(photoId);
        continue;
      }

      if (!memberByGroup.has(photo.groupId)) {
        memberByGroup.set(photo.groupId, await this.memberRepository.findByGroupIdAndUserId(photo.groupId, userId));
      }
      const me = memberByGroup.get(photo.groupId);
      const allowed = !!me && (photo.authorMemberId === me.id || me.role === ONGI_MEMBER_ROLE.ADMIN);
      if (!allowed) {
        skippedIds.push(photoId);
        continue;
      }

      await this.photoRepository.softDeletePhoto(photoId);
      deletedIds.push(photoId);
      urlsToCheck.add(photo.url);
    }

    const orphanUrls: string[] = [];
    for (const url of urlsToCheck) {
      if ((await this.photoRepository.countActiveByUrl(url)) === 0) orphanUrls.push(url);
    }
    if (orphanUrls.length > 0) await this.awsS3Service.deleteByUrls(orphanUrls);

    return { deletedIds, skippedIds };
  }
}

@Injectable()
export class OngiDeleteCommentUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    private readonly accessService: OngiPhotoAccessService,
  ) {}

  /** 댓글 삭제 — 댓글 작성자, 사진 작성자, 그룹 관리자 */
  async execute(userId: number, photoId: number, commentId: number): Promise<void> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo) throw new OngiPhotoNotFound();

    const comment = await this.photoRepository.findCommentById(commentId);
    if (!comment || comment.photoId !== photo.id) throw new OngiCommentNotFound();

    const me = await this.accessService.requireMember(photo.groupId, userId);
    const allowed = comment.authorMemberId === me.id || photo.authorMemberId === me.id || me.role === ONGI_MEMBER_ROLE.ADMIN;
    if (!allowed) throw new OngiCommentDeleteForbidden();

    await this.photoRepository.softDeleteComment(comment.id, photo.id);
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

@Injectable()
export class OngiScanUnfiledPhotosUseCase {
  constructor(
    @Inject(ONGI_PHOTO_REPOSITORY)
    private readonly photoRepository: IOngiPhotoRepository,

    private readonly accessService: OngiPhotoAccessService,
  ) {}

  /** 앨범에 담기지 않은 그룹 사진 (최신순) */
  async execute(userId: number, groupId: number): Promise<OngiPhotoView[]> {
    await this.accessService.requireMember(groupId, userId);

    const photos = await this.accessService.withoutBlocked(userId, await this.photoRepository.scanUnfiledByGroupId(groupId));

    return toViews(this.photoRepository, userId, photos);
  }
}

@Injectable()
export class OngiUploadPhotoFilesUseCase {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  /** 사진 파일을 S3 에 올리고 URL 목록을 돌려준다 — 요청 순서 그대로 */
  async execute(userId: number, files: UploadFile[]): Promise<OngiUploadedPhotoFileView[]> {
    if (files.length === 0) throw new OngiUploadPhotoRequired();

    const views: OngiUploadedPhotoFileView[] = [];

    for (const file of files) {
      const extension = file.originalname.includes('.') ? file.originalname.split('.').pop()!.toLowerCase() : 'jpg';
      const filename = new Util().generateRandomString(11) + '.' + Date.now() + '.' + extension;
      const path = ['ongi', 'photos', userId, moment().format('YYYYMMDD'), filename].join('/');

      // 가족 전용 사진 — 비공개로 저장하고 응답 시 presigned URL 로 내려준다
      const result = await this.awsS3Service.uploadStream(file.buffer, file.mimetype || 'image/jpeg', path, undefined, ObjectCannedACL.private);
      views.push({ url: result!.location });
    }

    return views;
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
