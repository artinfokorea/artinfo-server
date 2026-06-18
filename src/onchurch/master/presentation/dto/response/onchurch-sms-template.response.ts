import { ApiProperty } from '@nestjs/swagger';
import { OnchurchSmsTemplate } from '@/onchurch/master/domain/entity/onchurch-sms-template.entity';

export class OnchurchSmsTemplateResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String, description: '템플릿 이름' }) name: string;
  @ApiProperty({ type: String, description: '문자 제목' }) subject: string;
  @ApiProperty({ type: String, description: '문자 본문' }) content: string;
  @ApiProperty({ type: String, description: '생성 일시 (ISO)' }) createdAt: string;

  constructor(template: OnchurchSmsTemplate) {
    this.id = template.id;
    this.name = template.name;
    this.subject = template.subject;
    this.content = template.content;
    this.createdAt = template.createdAt.toISOString();
  }
}

export class OnchurchSmsTemplateListResponse {
  @ApiProperty({ type: [OnchurchSmsTemplateResponse] }) items: OnchurchSmsTemplateResponse[];

  constructor(templates: OnchurchSmsTemplate[]) {
    this.items = templates.map((t) => new OnchurchSmsTemplateResponse(t));
  }
}
