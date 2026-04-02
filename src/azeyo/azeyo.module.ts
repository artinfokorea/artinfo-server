import { Module } from '@nestjs/common';
import { AzeyoAuthModule } from '@/azeyo/auth/azeyo-auth.module';
import { AzeyoUserModule } from '@/azeyo/user/azeyo-user.module';
import { AzeyoSnsModule } from '@/azeyo/sns/azeyo-sns.module';
import { AzeyoCommunityModule } from '@/azeyo/community/azeyo-community.module';
import { AzeyoJokboModule } from '@/azeyo/jokbo/azeyo-jokbo.module';

@Module({
  imports: [AzeyoAuthModule, AzeyoUserModule, AzeyoSnsModule, AzeyoCommunityModule, AzeyoJokboModule],
})
export class AzeyoModule {}
