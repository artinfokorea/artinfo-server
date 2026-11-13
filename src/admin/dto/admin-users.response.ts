import { ApiProperty } from '@nestjs/swagger';
import { AdminUserRow, AdminUsersSummaryRow } from '@/admin/repository/admin-users.repository';
import { maskEmail } from '@/admin/dto/admin-stats.response';
import { maskPhone } from '@/admin/domain/admin-users.policy';

export class AdminUsersSummaryResponse {
  @ApiProperty({ type: Number, description: '회원 (탈퇴·관리자 제외)' }) members: number;
  @ApiProperty({ type: Number, description: '최근 7일 가입' }) membersLast7d: number;
  @ApiProperty({ type: Number, description: '관리자 계정' }) admins: number;
  @ApiProperty({ type: Number, description: '탈퇴 회원' }) withdrawn: number;
  @ApiProperty({ type: Number, description: '앱 설치 회원 (푸시 토큰 1개 이상)' }) appUsers: number;
  @ApiProperty({ type: Number, description: '최근 7일 앱 설치 회원' }) appUsersLast7d: number;
  @ApiProperty({ type: Number, description: 'iOS 기기를 가진 앱 회원' }) appUsersIos: number;
  @ApiProperty({ type: Number, description: 'Android 기기를 가진 앱 회원' }) appUsersAndroid: number;
  @ApiProperty({ type: Number, description: '채용 알림 켠 앱 회원 (저장 안 했으면 켜짐)' }) pushOn: number;
  @ApiProperty({ type: Number, description: '채용 알림 끈 앱 회원' }) pushOff: number;
  @ApiProperty({ type: Number, description: '등록된 기기(토큰) 수' }) devices: number;

  constructor(row: AdminUsersSummaryRow) {
    this.members = row.members;
    this.membersLast7d = row.members_7d;
    this.admins = row.admins;
    this.withdrawn = row.withdrawn;
    this.appUsers = row.app_users;
    this.appUsersLast7d = row.app_users_7d;
    this.appUsersIos = row.app_users_ios;
    this.appUsersAndroid = row.app_users_android;
    this.pushOn = row.push_on;
    this.pushOff = row.push_off;
    this.devices = row.devices;
  }
}

export class AdminUserResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, description: 'ADMIN / CLIENT' }) type: string;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: String }) nickname: string;
  @ApiProperty({ type: String, description: '마스킹된 이메일' }) email: string;
  @ApiProperty({ type: String, nullable: true, description: '마스킹된 전화번호' }) phone: string | null;
  @ApiProperty({ type: Date }) createdAt: Date;
  @ApiProperty({ type: Date, nullable: true, description: '탈퇴 시각' }) deletedAt: Date | null;
  @ApiProperty({ type: Date, nullable: true, description: '마지막 로그인' }) lastLoginAt: Date | null;
  @ApiProperty({ type: [String], description: '사용한 로그인 방식 (EMAIL·KAKAO·NAVER·GOOGLE·APPLE)' }) loginTypes: string[];
  @ApiProperty({ type: Boolean, description: '앱 설치 여부 (푸시 토큰 1개 이상)' }) hasApp: boolean;
  @ApiProperty({ type: Number, description: '등록된 기기 수' }) deviceCount: number;
  @ApiProperty({ type: [String], description: 'ios / android' }) platforms: string[];
  @ApiProperty({ type: Date, nullable: true, description: '첫 기기 등록 시각 (앱 설치 시점)' }) appInstalledAt: Date | null;
  @ApiProperty({ type: Boolean, description: '채용 알림 수신 (앱이 없어도 기본 true)' }) pushJob: boolean;

  constructor(row: AdminUserRow) {
    this.id = row.id;
    this.type = row.type;
    this.name = row.name;
    this.nickname = row.nickname;
    this.email = maskEmail(row.email);
    this.phone = maskPhone(row.phone);
    this.createdAt = row.createdAt;
    this.deletedAt = row.deletedAt;
    this.lastLoginAt = row.lastLoginAt;
    this.loginTypes = row.loginTypes ?? [];
    this.deviceCount = row.deviceCount;
    this.hasApp = row.deviceCount > 0;
    this.platforms = row.platforms ?? [];
    this.appInstalledAt = row.appInstalledAt;
    this.pushJob = row.pushJob;
  }
}

export class AdminUsersResponse {
  @ApiProperty({ type: Number, description: '조건에 맞는 전체 회원 수' }) total: number;
  @ApiProperty({ type: Number, description: '현재 페이지 (1부터)' }) page: number;
  @ApiProperty({ type: Number, description: '페이지 크기' }) size: number;
  @ApiProperty({ type: Number, description: '전체 페이지 수' }) totalPages: number;
  @ApiProperty({ type: String, description: '적용된 필터' }) filter: string;
  @ApiProperty({ type: String, nullable: true, description: '적용된 검색어' }) query: string | null;
  @ApiProperty({ type: [AdminUserResponse] }) users: AdminUserResponse[];

  constructor(args: { total: number; page: number; size: number; filter: string; query: string | null; rows: AdminUserRow[] }) {
    this.total = args.total;
    this.page = args.page;
    this.size = args.size;
    this.totalPages = Math.max(1, Math.ceil(args.total / args.size));
    this.filter = args.filter;
    this.query = args.query;
    this.users = args.rows.map(row => new AdminUserResponse(row));
  }
}
