import { Module } from '@nestjs/common';
import { AZEYO_SNS_CLIENT } from '@/azeyo/sns/domain/service/azeyo-sns-client.interface';
import { AzeyoSnsClientService } from '@/azeyo/sns/infrastructure/service/azeyo-sns-client.service';

@Module({
  providers: [{ provide: AZEYO_SNS_CLIENT, useClass: AzeyoSnsClientService }],
  exports: [AZEYO_SNS_CLIENT],
})
export class AzeyoSnsModule {}
