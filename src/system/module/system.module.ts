import { Module } from '@nestjs/common';
import { SystemController } from '@/system/controller/system.controller';
import { SystemService } from '@/system/service/system.service';

@Module({
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
