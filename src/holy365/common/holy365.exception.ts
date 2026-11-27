import { HttpException, HttpStatus } from '@nestjs/common';

/** 에러 코드는 HOLY365-{DOMAIN}-{NNN}. 프론트는 code 로 언어별 문구를 고른다 */
export class Holy365Exception extends HttpException {
  constructor(code: string, message: string, status: HttpStatus) {
    super({ code, message }, status);
  }
}

export const Holy365Errors = {
  unauthorized: () => new Holy365Exception('HOLY365-AUTH-001', '로그인이 필요합니다.', HttpStatus.UNAUTHORIZED),
  invalidName: () => new Holy365Exception('HOLY365-AUTH-006', '이름은 1~30자로 입력해 주세요.', HttpStatus.BAD_REQUEST),
  snsNotConfigured: () => new Holy365Exception('HOLY365-AUTH-007', '이 소셜 로그인은 아직 설정되지 않았습니다.', HttpStatus.SERVICE_UNAVAILABLE),
  invalidRedirect: () => new Holy365Exception('HOLY365-AUTH-008', '허용되지 않은 콜백 주소입니다.', HttpStatus.BAD_REQUEST),
  snsFailed: () => new Holy365Exception('HOLY365-AUTH-009', '소셜 로그인에 실패했습니다. 다시 시도해 주세요.', HttpStatus.BAD_REQUEST),
  invalidRefresh: () => new Holy365Exception('HOLY365-AUTH-010', '다시 로그인해 주세요.', HttpStatus.UNAUTHORIZED),
  devLoginDisabled: () => new Holy365Exception('HOLY365-AUTH-012', '개발용 로그인이 꺼져 있습니다.', HttpStatus.FORBIDDEN),
  profilePrivate: () => new Holy365Exception('HOLY365-SOCIAL-001', '비공개 프로필입니다.', HttpStatus.FORBIDDEN),
  cannotFollowSelf: () => new Holy365Exception('HOLY365-SOCIAL-002', '자기 자신은 팔로우할 수 없습니다.', HttpStatus.BAD_REQUEST),
  invalidChurch: () => new Holy365Exception('HOLY365-SOCIAL-003', '교회 이름과 지역을 입력해 주세요.', HttpStatus.BAD_REQUEST),
  churchNotFound: () => new Holy365Exception('HOLY365-SOCIAL-004', '교회를 찾을 수 없습니다.', HttpStatus.NOT_FOUND),
  postEmpty: () => new Holy365Exception('HOLY365-FEED-001', '글, 사진, 성경 구절 중 하나는 넣어 주세요.', HttpStatus.BAD_REQUEST),
  postTooLong: () => new Holy365Exception('HOLY365-FEED-002', '글은 2,000자까지 쓸 수 있습니다.', HttpStatus.BAD_REQUEST),
  postTooManyImages: () => new Holy365Exception('HOLY365-FEED-003', '사진은 10장까지 올릴 수 있습니다.', HttpStatus.BAD_REQUEST),
  postInvalidImage: () => new Holy365Exception('HOLY365-FEED-004', '사진을 다시 올려 주세요.', HttpStatus.BAD_REQUEST),
  postInvalidVerse: () =>
    new Holy365Exception('HOLY365-FEED-005', '성경 구절을 다시 골라 주세요 (구절은 5개까지, 한 구절에 30절까지).', HttpStatus.BAD_REQUEST),
  postNotFound: () => new Holy365Exception('HOLY365-FEED-006', '게시물을 찾을 수 없습니다.', HttpStatus.NOT_FOUND),
  notYourPost: () => new Holy365Exception('HOLY365-FEED-007', '내가 쓴 글만 지울 수 있습니다.', HttpStatus.FORBIDDEN),
  commentInvalid: () => new Holy365Exception('HOLY365-FEED-008', '댓글은 1~500자로 써 주세요.', HttpStatus.BAD_REQUEST),
  invalidAvatar: () => new Holy365Exception('HOLY365-USER-002', 'JPG · PNG · WEBP · GIF 이미지(10MB 이하)만 올릴 수 있습니다.', HttpStatus.BAD_REQUEST),
  userNotFound: () => new Holy365Exception('HOLY365-USER-001', '사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND),
  versionNotFound: () => new Holy365Exception('HOLY365-BIBLE-001', '번역본을 찾을 수 없습니다.', HttpStatus.NOT_FOUND),
  chapterNotFound: () => new Holy365Exception('HOLY365-BIBLE-002', '본문을 찾을 수 없습니다.', HttpStatus.NOT_FOUND),
  typedMismatch: () => new Holy365Exception('HOLY365-TYPING-001', '입력한 내용이 본문과 다릅니다.', HttpStatus.BAD_REQUEST),
};
