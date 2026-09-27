import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsIn, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';

const toIds = (ids: string[]) => [...new Set(ids.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0))];

export class OngiCreateChatRoomRequest {
  @IsArray()
  @ArrayNotEmpty({ message: '대화할 사람을 골라 주세요.' })
  @ArrayMaxSize(49)
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    required: true,
    description: '대화할 구성원 id (내가 속한 공간의 구성원). 1명이면 1:1, 2명 이상이면 그룹방',
    example: ['12', '31'],
  })
  memberIds: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '그룹방 이름 (30자, 비우면 참여자 이름으로 표시 · 1:1 은 무시)', example: '명절 준비' })
  name?: string;

  toMemberIds(): number[] {
    return toIds(this.memberIds);
  }
}

export class OngiInviteChatRequest {
  @IsArray()
  @ArrayNotEmpty({ message: '초대할 사람을 골라 주세요.' })
  @ArrayMaxSize(49)
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: true, description: '초대할 구성원 id (내가 속한 공간의 구성원)', example: ['12'] })
  memberIds: string[];

  toMemberIds(): number[] {
    return toIds(this.memberIds);
  }
}

export class OngiSendChatMessageRequest {
  @IsIn(['text', 'photo'], { message: '메시지 종류가 올바르지 않아요.' })
  @ApiProperty({ type: String, enum: ['text', 'photo'], required: true, description: '메시지 종류' })
  type: 'text' | 'photo';

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '글 (text, 1~1000자)', example: '저녁 먹자' })
  content?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '사진 URL (photo — POST /ongi/photos/files 응답의 urls)' })
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '축소본 URL (photo — 업로드 응답의 thumbUrls)' })
  thumbUrl?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false, description: '사진 가로/세로 비율', example: 0.75 })
  aspectRatio?: number;
}

export class OngiReadChatRequest {
  @IsNumberString({}, { message: '메시지 id 가 올바르지 않아요.' })
  @ApiProperty({ type: String, required: true, description: '여기까지 읽음 (가장 최근에 본 메시지 id)', example: '120' })
  messageId: string;
}
