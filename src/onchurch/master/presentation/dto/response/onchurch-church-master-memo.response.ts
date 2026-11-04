import { ApiProperty } from '@nestjs/swagger';

export class OnchurchChurchMasterMemoResponse {
  @ApiProperty({ type: String, nullable: true, description: '마스터 전용 메모' }) masterMemo: string | null;

  constructor(masterMemo: string | null) {
    this.masterMemo = masterMemo;
  }
}
