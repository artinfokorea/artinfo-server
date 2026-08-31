import { OngiPhoto, OngiPhotoCreator } from '@/ongi/photo/domain/entity/ongi-photo.entity';
import { OngiPhotoComment, OngiPhotoCommentCreator } from '@/ongi/photo/domain/entity/ongi-photo-comment.entity';

export const ONGI_PHOTO_REPOSITORY = Symbol('ONGI_PHOTO_REPOSITORY');

/** 사진 + 요청한 사용자 기준 좋아요 여부 */
export interface OngiPhotoView {
  photo: OngiPhoto;
  likedByMe: boolean;
  /** 요청자 기준 보이는 댓글 수 — 삭제·탈퇴·차단된 작성자 댓글 제외 (비정규화 comment_count 대신 조회 시 계산) */
  commentCount: number;
}

/** 사진 목록 조회 옵션 — 커서 페이지네이션 + 차단 작성자 제외 (모두 선택) */
export interface OngiPhotoScanOptions {
  /** 이 작성자(member id)들의 사진 제외 — 차단 필터를 SQL 에 넣어 페이지가 비지 않게 한다 */
  excludedMemberIds?: number[];
  /** 이 사진 id 이후(더 오래된)부터 — (created_at, id) 커서 */
  after?: number;
  limit?: number;
}

export interface IOngiPhotoRepository {
  create(creator: OngiPhotoCreator): Promise<OngiPhoto>;
  findById(id: number): Promise<OngiPhoto | null>;
  scanByGroupId(groupId: number, options?: OngiPhotoScanOptions): Promise<OngiPhoto[]>;
  scanByAlbumId(albumId: number, options?: OngiPhotoScanOptions): Promise<OngiPhoto[]>;
  scanUnfiledByGroupId(groupId: number, options?: OngiPhotoScanOptions): Promise<OngiPhoto[]>;
  scanByPersonId(groupId: number, personId: number, options?: OngiPhotoScanOptions): Promise<OngiPhoto[]>;
  likedPhotoIdsOf(userId: number, photoIds: number[]): Promise<number[]>;
  /** 사진별 살아있는 댓글 수 — excludedMemberIds 작성자 댓글은 제외 */
  countCommentsByPhotoIds(photoIds: number[], excludedMemberIds: number[]): Promise<Map<number, number>>;
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
