import { ApiProperty } from '@nestjs/swagger';

export class OnchurchChurchCustomDomainResponse {
  @ApiProperty({ type: String, nullable: true, description: '갱신된 교회 자체 도메인 대표 호스트 (해제 시 null)' })
  customDomain: string | null;

  constructor(customDomain: string | null) {
    this.customDomain = customDomain;
  }
}
