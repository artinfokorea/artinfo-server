import { Module } from '@nestjs/common';
import { OnchurchAuthModule } from '@/onchurch/auth/onchurch-auth.module';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';

@Module({
  imports: [OnchurchAuthModule, OnchurchUserModule],
})
export class OnchurchModule {}
