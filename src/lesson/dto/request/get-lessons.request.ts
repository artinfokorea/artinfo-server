import { List, Paging } from '@/common/type/type';
import { ApiProperty } from '@nestjs/swagger';
import { GetLessonsCommand } from '@/lesson/dto/command/get-lessons.command';
import { CountLessonsCommand } from '@/lesson/dto/command/count-lessons.command';
import { ToArray, ToNumberArray } from '@/common/decorator/transformer';
import { EnumNullableArray } from '@/common/decorator/validator';
import { PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';

export class GetLessonsRequest extends List {
  @ApiProperty({ type: String, required: false, description: '검색 키워드', example: '합창' })
  keyword: string | null = null;

  @EnumNullableArray(PROFESSIONAL_FIELD_CATEGORY)
  @ToArray()
  @ApiProperty({
    type: [PROFESSIONAL_FIELD_CATEGORY],
    enum: PROFESSIONAL_FIELD_CATEGORY,
    enumName: 'PROFESSIONAL_FIELD_CATEGORY',
    required: false,
    description: '전문 분야 카테고리',
    example: [PROFESSIONAL_FIELD_CATEGORY.CLASSIC],
  })
  professionalFields: PROFESSIONAL_FIELD_CATEGORY[] = [];

  @ToNumberArray()
  @ApiProperty({ type: [Number], required: false, description: '지역 아이디 목록', example: [1, 2] })
  provinceIds: number[] = [];

  toGetCommand() {
    const paging: Paging = { page: this.page, size: this.size };
    return new GetLessonsCommand({ keyword: this.keyword, professionalFields: this.professionalFields, provinceIds: this.provinceIds, paging: paging });
  }

  toCountCommand() {
    return new CountLessonsCommand({ keyword: this.keyword, professionalFields: this.professionalFields, provinceIds: this.provinceIds });
  }
}
