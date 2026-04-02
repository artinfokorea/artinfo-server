import { ApiProperty } from '@nestjs/swagger';
import { AzeyoJokboTemplate, AZEYO_JOKBO_CATEGORY } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';

export class AzeyoJokboTemplateResponse {
  @ApiProperty() id: number;
  @ApiProperty() category: AZEYO_JOKBO_CATEGORY;
  @ApiProperty() authorId: number;
  @ApiProperty() authorName: string;
  @ApiProperty() title: string;
  @ApiProperty() content: string;
  @ApiProperty() likeCount: number;
  @ApiProperty() copyCount: number;
  @ApiProperty() isLiked: boolean;
  @ApiProperty() createdAt: Date;

  constructor(template: AzeyoJokboTemplate) {
    this.id = template.id;
    this.category = template.category;
    this.authorId = template.user?.id ?? template.userId;
    this.authorName = template.user?.nickname ?? '';
    this.title = template.title;
    this.content = template.content;
    this.likeCount = template.likesCount;
    this.copyCount = template.copyCount;
    this.isLiked = template.isLiked;
    this.createdAt = template.createdAt;
  }
}

export class AzeyoJokboTemplatesResponse {
  @ApiProperty({ type: [AzeyoJokboTemplateResponse] }) templates: AzeyoJokboTemplateResponse[];
  @ApiProperty() totalCount: number;

  constructor({ items, totalCount }: { items: AzeyoJokboTemplate[]; totalCount: number }) {
    this.templates = items.map(t => new AzeyoJokboTemplateResponse(t));
    this.totalCount = totalCount;
  }
}

export class AzeyoMyJokboTemplatesResponse {
  @ApiProperty({ type: [AzeyoJokboTemplateResponse] }) templates: AzeyoJokboTemplateResponse[];
  @ApiProperty() totalCount: number;

  constructor(items: AzeyoJokboTemplate[]) {
    this.templates = items.map(t => new AzeyoJokboTemplateResponse(t));
    this.totalCount = items.length;
  }
}
