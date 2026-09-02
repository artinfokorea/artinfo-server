import { Module } from '@nestjs/common';
import { OngiConfigController } from '@/ongi/config/presentation/controller/ongi-config.controller';
import { OngiGetAppConfigUseCase } from '@/ongi/config/application/usecase/ongi-config.usecase';

@Module({
  controllers: [OngiConfigController],
  providers: [OngiGetAppConfigUseCase],
})
export class OngiConfigModule {}
