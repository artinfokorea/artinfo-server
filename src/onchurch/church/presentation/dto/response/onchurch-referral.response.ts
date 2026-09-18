import { ApiProperty } from '@nestjs/swagger';
import { OnchurchMyReferral } from '@/onchurch/church/application/usecase/onchurch-referral.usecase';

export class OnchurchMyReferralResponse {
  @ApiProperty({ type: String, description: '우리 교회 추천 코드(다른 교회에게 알려주는 값)' }) code: string;
  @ApiProperty({ type: Number, description: '우리 코드를 입력하고 가입한 교회 수' }) referredCount: number;
  @ApiProperty({ type: String, nullable: true, description: '우리가 입력한 추천인 교회 이름. 미입력이면 null' })
  referredByChurchName: string | null;
  @ApiProperty({ type: Boolean, description: '추천인 코드를 입력할 수 있는 상태인지 여부' }) canApply: boolean;

  constructor(referral: OnchurchMyReferral) {
    this.code = referral.code;
    this.referredCount = referral.referredCount;
    this.referredByChurchName = referral.referredByChurchName;
    this.canApply = referral.canApply;
  }
}
