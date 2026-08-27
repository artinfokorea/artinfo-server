import { OngiPhoto, OngiPhotoCreator } from '@/ongi/photo/domain/entity/ongi-photo.entity';
import { OngiPhotoComment, OngiPhotoCommentCreator } from '@/ongi/photo/domain/entity/ongi-photo-comment.entity';

export const ONGI_PHOTO_REPOSITORY = Symbol('ONGI_PHOTO_REPOSITORY');

/** 사진 + 요청한 사용자 기준 좋아요 여부 */
export interface OngiPhotoView {
  photo: OngiPhoto;
  likedByMe: boolean;
}

export interface IOngiPhotoRepository {
  create(creator: OngiPhotoCreator): Promise<OngiPhoto>;
  findById(id: number): Promise<OngiPhoto | null>;
  scanByGroupId(groupId: number): Promise<OngiPhoto[]>;
  scanByAlbumId(albumId: number): Promise<OngiPhoto[]>;
  scanUnfiledByGroupId(groupId: number): Promise<OngiPhoto[]>;
  scanByPersonId(groupId: number, personId: number): Promise<OngiPhoto[]>;
  likedPhotoIdsOf(userId: number, photoIds: number[]): Promise<number[]>;
  /** 좋아요 토글 — 토글 후 좋아요 상태를 반환 */
  toggleLike(photoId: number, userId: number): Promise<boolean>;
  scanCommentsByPhotoId(photoId: number): Promise<OngiPhotoComment[]>;
  createComment(creator: OngiPhotoCommentCreator): Promise<OngiPhotoComment>;
  findCommentById(id: number): Promise<OngiPhotoComment | null>;
  /** 앨범 이동 (null 이면 미분류) */
  moveToAlbum(photoIds: number[], albumId: number | null): Promise<void>;
  /** 사진과 달린 댓글을 함께 소프트 삭제 */
  softDeletePhoto(photoId: number): Promise<void>;
  /** 댓글 소프트 삭제 + 사진 댓글 수 감소 */
  softDeleteComment(commentId: number, photoId: number): Promise<void>;
  /** 같은 파일 URL 을 쓰는 살아있는 사진 수 — 멀티 그룹 업로드는 파일 하나를 여러 사진이 공유하므로 0 일 때만 S3 에서 지운다 */
  countActiveByUrl(url: string): Promise<number>;
  /** 사용자들이 가진 구성원 id 목록 (삭제되지 않은 구성원) — 차단 사용자 콘텐츠 필터용 */
  memberIdsOfUsers(userIds: number[]): Promise<number[]>;
}
