import { ApiProperty } from '@nestjs/swagger';
import { TransferChurchOwnerResult } from '@/onchurch/master/application/usecase/onchurch-transfer-church-owner.usecase';

export class OnchurchTransferChurchOwnerResponse {
  @ApiProperty({ type: Number, description: '새 소유자 사용자 ID' }) ownerId: number;
  @ApiProperty({ type: String, description: '새 소유자 이름' }) ownerName: string;
  @ApiProperty({ type: String, description: '새 소유자 연락처' }) ownerPhone: string;

  constructor(result: TransferChurchOwnerResult) {
    this.ownerId = result.ownerId;
    this.ownerName = result.ownerName;
    this.ownerPhone = result.ownerPhone;
  }
}
