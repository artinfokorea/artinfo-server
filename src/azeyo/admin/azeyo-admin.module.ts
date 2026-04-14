import { Module } from '@nestjs/common';
import { AzeyoAdminController } from '@/azeyo/admin/presentation/controller/azeyo-admin.controller';
import { AzeyoUserModule } from '@/azeyo/user/azeyo-user.module';
import { AzeyoCommunityModule } from '@/azeyo/community/azeyo-community.module';

@Module({
  imports: [AzeyoUserModule, AzeyoCommunityModule],
  controllers: [AzeyoAdminController],
})
export class AzeyoAdminModule {}
