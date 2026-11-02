import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActivityPingRequest {
  @IsString()
  @MaxLength(36)
  @ApiProperty({ type: String, description: '브라우저가 만든 방문자 UUID v4', example: '3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b' })
  visitorId: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false, description: '지난 전송 이후 탭이 화면에 보인 시간(초). 최대 1800', example: 60 })
  seconds?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false, description: '새 방문의 첫 전송이면 true (30분 넘게 쉬었다 온 경우 포함)' })
  newSession?: boolean;
}
