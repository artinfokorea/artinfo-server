import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OnchurchLedgerType } from '@/onchurch/master/domain/entity/onchurch-ledger-entry.entity';

export class OnchurchCreateLedgerEntryRequest {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '거래 일자는 YYYY-MM-DD 형식이어야 합니다.' })
  @ApiProperty({ type: String, required: true, description: '거래 일자 (YYYY-MM-DD)' })
  entryDate: string;

  @IsIn(['income', 'expense'])
  @ApiProperty({ type: String, enum: ['income', 'expense'], required: true, description: '수입/지출 구분' })
  type: OnchurchLedgerType;

  @IsInt()
  @Min(1, { message: '금액은 1원 이상이어야 합니다.' })
  @ApiProperty({ type: Number, required: true, description: '금액(원). 항상 양수' })
  amount: number;

  @NotBlank()
  @MaxLength(100)
  @ApiProperty({ type: String, required: true, description: '항목·수단 (어떻게 들어왔/나갔는지)' })
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiProperty({ type: String, required: false, description: '메모' })
  memo?: string;
}
