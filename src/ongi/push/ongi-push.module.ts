import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiPushToken } from '@/ongi/push/domain/entity/ongi-push-token.entity';
import { ONGI_PUSH_TOKEN_REPOSITORY } from '@/ongi/push/domain/repository/ongi-push-token.repository.interface';
import { OngiPushTokenRepository } from '@/ongi/push/infrastructure/repository/ongi-push-token.repository';
import { OngiPushController } from '@/ongi/push/presentation/controller/ongi-push.controller';
import { OngiRegisterPushTokenUseCase, OngiUnregisterPushTokenUseCase } from '@/ongi/push/application/usecase/ongi-push.usecase';
import { OngiPushService } from '@/ongi/push/application/service/ongi-push.service';
import { OngiGroupModule } from '@/ongi/group/ongi-group.module';

@Module({
  imports: [TypeOrmModule.forFeature([OngiPushToken]), forwardRef(() => OngiGroupModule)],
  controllers: [OngiPushController],
  providers: [
    { provide: ONGI_PUSH_TOKEN_REPOSITORY, useClass: OngiPushTokenRepository },
    OngiRegisterPushTokenUseCase,
    OngiUnregisterPushTokenUseCase,
    OngiPushService,
  ],
  exports: [OngiPushService, ONGI_PUSH_TOKEN_REPOSITORY],
})
export class OngiPushModule {}
