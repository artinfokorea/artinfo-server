import { ApiProperty } from '@nestjs/swagger';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchAuthTokensResponse } from '@/onchurch/auth/presentation/dto/response/onchurch-auth-tokens.response';

export class OnchurchAppLoginChurchResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) slug: string;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: String, nullable: true }) logoUrl: string | null;
  @ApiProperty({ type: String, nullable: true, description: '교회 자체 도메인 대표 호스트 (미연결이면 null)' }) customDomain: string | null;

  constructor(church: OnchurchChurch) {
    this.id = church.id;
    this.slug = church.slug;
    this.name = church.name;
    this.logoUrl = church.logoUrl ?? null;
    this.customDomain = church.customDomain?.trim() || null;
  }
}

export class OnchurchAppLoginResponse extends OnchurchAuthTokensResponse {
  @ApiProperty({ type: OnchurchAppLoginChurchResponse, description: '로그인한 계정의 교회 — 앱은 이 교회로 바로 들어간다' })
  church: OnchurchAppLoginChurchResponse;

  constructor(auth: OnchurchAuth, church: OnchurchChurch) {
    super(auth);
    this.church = new OnchurchAppLoginChurchResponse(church);
  }
}
