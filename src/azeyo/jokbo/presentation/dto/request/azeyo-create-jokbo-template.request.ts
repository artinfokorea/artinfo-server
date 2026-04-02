import { ApiProperty } from '@nestjs/swagger';
import { NotBlank, Enum } from '@/common/decorator/validator';
import { AZEYO_JOKBO_CATEGORY } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';
import { AzeyoCreateJokboTemplateCommand } from '@/azeyo/jokbo/application/command/azeyo-create-jokbo-template.command';

export class AzeyoCreateJokboTemplateRequest {
  @Enum(AZEYO_JOKBO_CATEGORY)
  @ApiProperty({ enum: AZEYO_JOKBO_CATEGORY, required: true, description: '카테고리' })
  category: AZEYO_JOKBO_CATEGORY;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '제목' })
  title: string;

  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '내용' })
  content: string;

  toCommand(userId: number) {
    return new AzeyoCreateJokboTemplateCommand({
      userId,
      category: this.category,
      title: this.title,
      content: this.content,
    });
  }
}
