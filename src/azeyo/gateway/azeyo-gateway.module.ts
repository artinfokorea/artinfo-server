import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzeyoGateway } from '@/azeyo/gateway/azeyo.gateway';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AzeyoUser])],
  providers: [AzeyoGateway],
  exports: [AzeyoGateway],
})
export class AzeyoGatewayModule {}
