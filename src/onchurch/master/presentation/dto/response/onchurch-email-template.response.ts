import { ApiProperty } from '@nestjs/swagger';
import { OnchurchEmailTemplate } from '@/onchurch/master/domain/entity/onchurch-email-template.entity';

export class OnchurchEmailTemplateResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, description: '템플릿 이름' }) name: string;
  @ApiProperty({ type: String, description: '메일 제목' }) subject: string;
  @ApiProperty({ type: String, description: '메일 본문' }) content: string;
  @ApiProperty({ type: String, description: '생성 일시 (ISO)' }) createdAt: string;

  constructor(template: OnchurchEmailTemplate) {
    this.id = template.id;
    this.name = template.name;
    this.subject = template.subject;
    this.content = template.content;
    this.createdAt = template.createdAt.toISOString();
  }
}

export class OnchurchEmailTemplateListResponse {
  @ApiProperty({ type: [OnchurchEmailTemplateResponse] }) items: OnchurchEmailTemplateResponse[];

  constructor(templates: OnchurchEmailTemplate[]) {
    this.items = templates.map((t) => new OnchurchEmailTemplateResponse(t));
  }
}
