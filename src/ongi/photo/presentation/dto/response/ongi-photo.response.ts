import { ApiProperty } from '@nestjs/swagger';
import { OngiPhotoView } from '@/ongi/photo/domain/repository/ongi-photo.repository.interface';
import { OngiUploadedPhotoFileView } from '@/ongi/photo/application/usecase/ongi-photo.usecase';
import { OngiPhotoComment } from '@/ongi/photo/domain/entity/ongi-photo-comment.entity';

export class OngiPhotoResponse {
  @ApiProperty({ type: String, description: '사진 id' })
  id: string;

  @ApiProperty({ type: String, description: '그룹 id' })
  groupId: string;

  @ApiProperty({ type: String, description: '사진 URL' })
  url: string;

  @ApiProperty({ type: Number, description: '세로 비율 힌트 (width/height)' })
  aspectRatio: number;

  @ApiProperty({ type: String, description: '작성자 구성원 id' })
  authorId: string;

  @ApiProperty({ type: String, required: false, description: '앨범 id' })
  albumId?: string;

  @ApiProperty({ type: String, required: false, description: '문구' })
  caption?: string;

  @ApiProperty({ type: String, required: false, description: '위치' })
  location?: string;

  @ApiProperty({ type: String, description: '작성 시각 (ISO)' })
  createdAt: string;

  @ApiProperty({ type: Number, description: '따뜻해요 수' })
  likeCount: number;

  @ApiProperty({ type: Number, description: '댓글 수' })
  commentCount: number;

  @ApiProperty({ type: Boolean, description: '내가 따뜻해요를 눌렀는지' })
  likedByMe: boolean;

  @ApiProperty({ type: [String], description: '함께 찍힌 인물 id 목록' })
  personIds: string[];

  constructor(view: OngiPhotoView) {
    const { photo } = view;

    this.id = String(photo.id);
    this.groupId = String(photo.groupId);
    this.url = photo.url;
    this.aspectRatio = Number(photo.aspectRatio);
    this.authorId = String(photo.authorMemberId);
    this.albumId = photo.albumId === null ? undefined : String(photo.albumId);
    this.caption = photo.caption ?? undefined;
    this.location = photo.location ?? undefined;
    this.createdAt = new Date(photo.createdAt).toISOString();
    this.likeCount = photo.likeCount;
    this.commentCount = photo.commentCount;
    this.likedByMe = view.likedByMe;
    this.personIds = (photo.personIds ?? []).map(id => String(id));
  }
}

export class OngiPhotoListResponse {
  @ApiProperty({ type: [OngiPhotoResponse], description: '사진 목록 (최신순)' })
  photos: OngiPhotoResponse[];

  constructor(views: OngiPhotoView[]) {
    this.photos = views.map(view => new OngiPhotoResponse(view));
  }
}

export class OngiCommentResponse {
  @ApiProperty({ type: String, description: '댓글 id' })
  id: string;

  @ApiProperty({ type: String, description: '사진 id' })
  photoId: string;

  @ApiProperty({ type: String, description: '작성자 구성원 id' })
  authorId: string;

  @ApiProperty({ type: String, description: '댓글 내용' })
  text: string;

  @ApiProperty({ type: String, description: '작성 시각 (ISO)' })
  createdAt: string;

  constructor(comment: OngiPhotoComment) {
    this.id = String(comment.id);
    this.photoId = String(comment.photoId);
    this.authorId = String(comment.authorMemberId);
    this.text = comment.text;
    this.createdAt = new Date(comment.createdAt).toISOString();
  }
}

export class OngiCommentListResponse {
  @ApiProperty({ type: [OngiCommentResponse], description: '댓글 목록 (오래된 순)' })
  comments: OngiCommentResponse[];

  constructor(comments: OngiPhotoComment[]) {
    this.comments = comments.map(comment => new OngiCommentResponse(comment));
  }
}

export class OngiMovedPhotosResponse {
  @ApiProperty({ type: [String], description: '옮긴 사진 id' })
  movedIds: string[];

  @ApiProperty({ type: [String], description: '권한이 없거나 다른 그룹이라 건너뛴 사진 id' })
  skippedIds: string[];

  constructor(result: { movedIds: number[]; skippedIds: number[] }) {
    this.movedIds = result.movedIds.map(String);
    this.skippedIds = result.skippedIds.map(String);
  }
}

export class OngiDeletedPhotosResponse {
  @ApiProperty({ type: [String], description: '삭제된 사진 id' })
  deletedIds: string[];

  @ApiProperty({ type: [String], description: '권한이 없거나 이미 없어서 건너뛴 사진 id' })
  skippedIds: string[];

  constructor(result: { deletedIds: number[]; skippedIds: number[] }) {
    this.deletedIds = result.deletedIds.map(String);
    this.skippedIds = result.skippedIds.map(String);
  }
}

export class OngiUploadedPhotoFilesResponse {
  @ApiProperty({ type: [String], description: '업로드된 사진 URL 목록 (요청 파일 순서 그대로)' })
  urls: string[];

  constructor(views: OngiUploadedPhotoFileView[]) {
    this.urls = views.map(view => view.url);
  }
}
