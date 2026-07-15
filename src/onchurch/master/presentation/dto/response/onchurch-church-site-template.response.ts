import { ApiProperty } from '@nestjs/swagger';

export class OnchurchChurchSiteTemplateResponse {
  @ApiProperty({ type: String, description: '갱신된 공개 홈페이지 템플릿 ID' })
  siteTemplate: string;

  constructor(siteTemplate: string) {
    this.siteTemplate = siteTemplate;
  }
}
