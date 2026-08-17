import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';

export class OngiAddCommentRequest {
  @NotBlank()
  @MaxLength(500)
  @ApiProperty({ type: String, required: true, description: '댓글 내용', example: '사진 너무 좋다!' })
  text: string;
}
