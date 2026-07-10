import { ApiProperty } from '@nestjs/swagger';

export class OnchurchChurchPublishedResponse {
  @ApiProperty({ type: Boolean, description: '운영 여부(공개 상태)' }) isPublished: boolean;

  constructor(isPublished: boolean) {
    this.isPublished = isPublished;
  }
}
