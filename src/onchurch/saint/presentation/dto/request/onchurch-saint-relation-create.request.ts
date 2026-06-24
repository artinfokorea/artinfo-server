import { ApiProperty } from '@nestjs/swagger';
import { IsInt, MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchSaintRelationCreateCommand } from '@/onchurch/saint/application/command/onchurch-saint-write.command';

export class OnchurchSaintRelationCreateRequest {
  @IsInt()
  @ApiProperty({ type: Number, required: true, description: '대상 성도 ID' })
  relatedSaintId: number;

  @NotBlank()
  @MaxLength(40)
  @ApiProperty({ type: String, required: true, description: '관계', example: '배우자' })
  relation: string;

  toCommand(): OnchurchSaintRelationCreateCommand {
    return new OnchurchSaintRelationCreateCommand({
      relatedSaintId: this.relatedSaintId,
      relation: this.relation.trim(),
    });
  }
}
