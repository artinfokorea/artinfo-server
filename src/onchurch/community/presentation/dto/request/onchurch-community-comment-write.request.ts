import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class OnchurchCommunityCommentWriteRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  @ApiProperty({ type: String, required: true, description: '댓글 내용 (1~1000자)', example: '은혜가 됩니다. 함께 기도할게요.' })
  content: string;
}
