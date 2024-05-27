import { ApiProperty } from '@nestjs/swagger';
import { ADVERTISEMENT_TYPE } from '@/system/entity/advertisement.entity';
import { Enum, NotBlank } from '@/common/decorator/validator';

export class AdvertisementsRequest {
  @Enum(ADVERTISEMENT_TYPE)
  @NotBlank()
  @ApiProperty({
    enum: ADVERTISEMENT_TYPE,
    enumName: 'ADVERTISEMENT_TYPE',
    required: true,
    description: '광고 타입',
    example: ADVERTISEMENT_TYPE.BANNER,
  })
  type: ADVERTISEMENT_TYPE;
}
