import { ApiProperty } from '@nestjs/swagger';
import { List } from '@/common/type/type';
import { AZEYO_JOKBO_CATEGORY } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';

export class AzeyoScanJokboTemplatesRequest extends List {
  @ApiProperty({ enum: AZEYO_JOKBO_CATEGORY, required: false, description: '카테고리 필터' })
  category: AZEYO_JOKBO_CATEGORY | null;
}
