import { ApiProperty } from '@nestjs/swagger';
import { AzeyoContentTest } from '@/azeyo/content/domain/entity/azeyo-content-test.entity';

export class AzeyoContentTestResponse {
  @ApiProperty() id: number;
  @ApiProperty() slug: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty({ nullable: true }) imageUrl: string | null;
  @ApiProperty() questionCount: number;
  @ApiProperty() duration: string;
  @ApiProperty({ nullable: true }) badge: string | null;

  constructor(entity: AzeyoContentTest) {
    this.id = entity.id;
    this.slug = entity.slug;
    this.title = entity.title;
    this.description = entity.description;
    this.imageUrl = entity.imageUrl;
    this.questionCount = entity.questionCount;
    this.duration = entity.duration;
    this.badge = entity.badge;
  }
}

export class AzeyoContentTestsResponse {
  @ApiProperty({ type: [AzeyoContentTestResponse] }) tests: AzeyoContentTestResponse[];

  constructor(items: AzeyoContentTest[]) {
    this.tests = items.map(t => new AzeyoContentTestResponse(t));
  }
}
