import { Module } from '@nestjs/common';
import { AzeyoAuthModule } from '@/azeyo/auth/azeyo-auth.module';
import { AzeyoUserModule } from '@/azeyo/user/azeyo-user.module';
import { AzeyoSnsModule } from '@/azeyo/sns/azeyo-sns.module';

@Module({
  imports: [AzeyoAuthModule, AzeyoUserModule, AzeyoSnsModule],
})
export class AzeyoModule {}
