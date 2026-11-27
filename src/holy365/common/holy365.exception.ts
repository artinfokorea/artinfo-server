import { HttpException, HttpStatus } from '@nestjs/common';

/** 에러 코드는 HOLY365-{DOMAIN}-{NNN}. 프론트는 code 로 언어별 문구를 고른다 */
export class Holy365Exception extends HttpException {
  constructor(code: string, message: string, status: HttpStatus) {
    super({ code, message }, status);
  }
}

export const Holy365Errors = {
  unauthorized: () => new Holy365Exception('HOLY365-AUTH-001', '로그인이 필요합니다.', HttpStatus.UNAUTHORIZED),
  emailTaken: () => new Holy365Exception('HOLY365-AUTH-002', '이미 가입된 이메일입니다.', HttpStatus.CONFLICT),
  invalidCredentials: () => new Holy365Exception('HOLY365-AUTH-003', '이메일 또는 비밀번호가 올바르지 않습니다.', HttpStatus.UNAUTHORIZED),
  invalidEmail: () => new Holy365Exception('HOLY365-AUTH-004', '이메일 형식이 올바르지 않습니다.', HttpStatus.BAD_REQUEST),
  weakPassword: () => new Holy365Exception('HOLY365-AUTH-005', '비밀번호는 8~64자, 영문과 숫자를 포함해야 합니다.', HttpStatus.BAD_REQUEST),
  invalidName: () => new Holy365Exception('HOLY365-AUTH-006', '이름은 1~30자로 입력해 주세요.', HttpStatus.BAD_REQUEST),
  snsNotConfigured: () => new Holy365Exception('HOLY365-AUTH-007', '이 소셜 로그인은 아직 설정되지 않았습니다.', HttpStatus.SERVICE_UNAVAILABLE),
  invalidRedirect: () => new Holy365Exception('HOLY365-AUTH-008', '허용되지 않은 콜백 주소입니다.', HttpStatus.BAD_REQUEST),
  snsFailed: () => new Holy365Exception('HOLY365-AUTH-009', '소셜 로그인에 실패했습니다. 다시 시도해 주세요.', HttpStatus.BAD_REQUEST),
  invalidRefresh: () => new Holy365Exception('HOLY365-AUTH-010', '다시 로그인해 주세요.', HttpStatus.UNAUTHORIZED),
  notEmailAccount: () => new Holy365Exception('HOLY365-AUTH-011', '소셜 로그인 계정은 비밀번호가 없습니다.', HttpStatus.BAD_REQUEST),
  userNotFound: () => new Holy365Exception('HOLY365-USER-001', '사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND),
  versionNotFound: () => new Holy365Exception('HOLY365-BIBLE-001', '번역본을 찾을 수 없습니다.', HttpStatus.NOT_FOUND),
  chapterNotFound: () => new Holy365Exception('HOLY365-BIBLE-002', '본문을 찾을 수 없습니다.', HttpStatus.NOT_FOUND),
  typedMismatch: () => new Holy365Exception('HOLY365-TYPING-001', '입력한 내용이 본문과 다릅니다.', HttpStatus.BAD_REQUEST),
};
