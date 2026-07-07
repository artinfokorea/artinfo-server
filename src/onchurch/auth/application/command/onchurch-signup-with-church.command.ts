// 랜딩 위저드 통합 가입 커맨드.
// 4단계(기본정보·연락처·담임목사·예배) + 인증 정보를 한 번에 받아 계정+교회를 생성한다.
// - 아이디(loginId) = 서브도메인(slug)
// - 계정 이름(name) = 교회 이름(churchName)
// - 비밀번호 = 서버 생성 임시비밀번호(요청에 없음)
export class OnchurchSignupWithChurchCommand {
  slug: string;
  churchName: string;
  // 가입자 휴대폰 — 본인 인증 대상이자 계정 연락처.
  phone: string;
  // 교회 대표 연락처 — 홈페이지에 노출되는 값(유선 등 자유 형식).
  churchPhone: string;
  email: string;
  address: string;
  pastorName: string;
  worshipName: string;
  worshipTime: string;

  constructor(params: {
    slug: string;
    churchName: string;
    phone: string;
    churchPhone: string;
    email: string;
    address: string;
    pastorName: string;
    worshipName: string;
    worshipTime: string;
  }) {
    this.slug = params.slug;
    this.churchName = params.churchName;
    this.phone = params.phone;
    this.churchPhone = params.churchPhone;
    this.email = params.email;
    this.address = params.address;
    this.pastorName = params.pastorName;
    this.worshipName = params.worshipName;
    this.worshipTime = params.worshipTime;
  }
}
