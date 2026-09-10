import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { SALPYEO_REHOST_DEFAULT_LIMIT, SALPYEO_REHOST_MAX_LIMIT } from '@/salpyeo/facility/application/usecase/salpyeo-admin-rehost-images.usecase';

export class SalpyeoAdminRehostRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(SALPYEO_REHOST_MAX_LIMIT)
  @ApiPropertyOptional({
    type: Number,
    description: `한 번에 처리할 시설 수 (최대 ${SALPYEO_REHOST_MAX_LIMIT}). 요청이 오래 걸리지 않도록 작게 끊는다`,
    example: SALPYEO_REHOST_DEFAULT_LIMIT,
  })
  limit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  @ApiPropertyOptional({ type: String, description: '이 시설만 이전 (실패했던 시설 재시도용). 주면 limit 은 무시된다', example: 'post-a9656bde' })
  slug?: string;
}
