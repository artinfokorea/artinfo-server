import { Module } from '@nestjs/common';
import { OngiLegalController } from '@/ongi/legal/presentation/controller/ongi-legal.controller';
import { OngiGetLegalDocUseCase } from '@/ongi/legal/application/usecase/ongi-legal.usecase';

@Module({
  controllers: [OngiLegalController],
  providers: [OngiGetLegalDocUseCase],
})
export class OngiLegalModule {}
