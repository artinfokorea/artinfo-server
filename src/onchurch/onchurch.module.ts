import { Module } from '@nestjs/common';
import { OnchurchAuthModule } from '@/onchurch/auth/onchurch-auth.module';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';

@Module({
  imports: [OnchurchAuthModule, OnchurchUserModule, OnchurchChurchModule],
})
export class OnchurchModule {}
