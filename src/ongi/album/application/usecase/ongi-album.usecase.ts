import { Inject, Injectable } from '@nestjs/common';
import { IOngiAlbumRepository, ONGI_ALBUM_REPOSITORY, OngiAlbumView } from '@/ongi/album/domain/repository/ongi-album.repository.interface';
import { IOngiMemberRepository, ONGI_MEMBER_REPOSITORY } from '@/ongi/group/domain/repository/ongi-member.repository.interface';
import { OngiNotGroupAdmin, OngiNotGroupMember } from '@/ongi/group/domain/exception/ongi-group.exception';
import { ONGI_MEMBER_ROLE } from '@/ongi/group/domain/entity/ongi-member.entity';
import { OngiAlbumNotFound } from '@/ongi/album/domain/exception/ongi-album.exception';

@Injectable()
export class OngiScanAlbumsUseCase {
  constructor(
    @Inject(ONGI_ALBUM_REPOSITORY)
    private readonly albumRepository: IOngiAlbumRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async execute(userId: number, groupId: number): Promise<OngiAlbumView[]> {
    const me = await this.memberRepository.findByGroupIdAndUserId(groupId, userId);
    if (!me) throw new OngiNotGroupMember();

    return this.albumRepository.scanViewsByGroupId(groupId);
  }
}

@Injectable()
export class OngiCreateAlbumUseCase {
  constructor(
    @Inject(ONGI_ALBUM_REPOSITORY)
    private readonly albumRepository: IOngiAlbumRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async execute(userId: number, groupId: number, title: string): Promise<OngiAlbumView> {
    const me = await this.memberRepository.findByGroupIdAndUserId(groupId, userId);
    if (!me) throw new OngiNotGroupMember();
    if (me.role !== ONGI_MEMBER_ROLE.ADMIN) throw new OngiNotGroupAdmin();

    const album = await this.albumRepository.create({ groupId, title, coverUrl: null });
    const view = await this.albumRepository.getViewById(album.id);
    if (!view) throw new OngiAlbumNotFound();

    return view;
  }
}

@Injectable()
export class OngiRenameAlbumUseCase {
  constructor(
    @Inject(ONGI_ALBUM_REPOSITORY)
    private readonly albumRepository: IOngiAlbumRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  async execute(userId: number, albumId: number, title: string): Promise<OngiAlbumView> {
    const album = await this.albumRepository.findById(albumId);
    if (!album) throw new OngiAlbumNotFound();

    const me = await this.memberRepository.findByGroupIdAndUserId(album.groupId, userId);
    if (!me) throw new OngiNotGroupMember();
    if (me.role !== ONGI_MEMBER_ROLE.ADMIN) throw new OngiNotGroupAdmin();

    await this.albumRepository.rename(albumId, title);

    const view = await this.albumRepository.getViewById(albumId);
    if (!view) throw new OngiAlbumNotFound();

    return view;
  }
}

@Injectable()
export class OngiDeleteAlbumUseCase {
  constructor(
    @Inject(ONGI_ALBUM_REPOSITORY)
    private readonly albumRepository: IOngiAlbumRepository,

    @Inject(ONGI_MEMBER_REPOSITORY)
    private readonly memberRepository: IOngiMemberRepository,
  ) {}

  /** 앨범만 삭제 (관리자만) — 담긴 사진은 미분류로 이동 */
  async execute(userId: number, albumId: number): Promise<void> {
    const album = await this.albumRepository.findById(albumId);
    if (!album) throw new OngiAlbumNotFound();

    const me = await this.memberRepository.findByGroupIdAndUserId(album.groupId, userId);
    if (!me) throw new OngiNotGroupMember();
    if (me.role !== ONGI_MEMBER_ROLE.ADMIN) throw new OngiNotGroupAdmin();

    await this.albumRepository.softDeleteAndDetachPhotos(albumId);
  }
}
