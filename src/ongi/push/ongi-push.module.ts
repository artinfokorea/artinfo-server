import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiPushToken } from '@/ongi/push/domain/entity/ongi-push-token.entity';
import { OngiPushPreference } from '@/ongi/push/domain/entity/ongi-push-preference.entity';
import { ONGI_PUSH_PREFERENCE_REPOSITORY } from '@/ongi/push/domain/repository/ongi-push-preference.repository.interface';
import { OngiPushPreferenceRepository } from '@/ongi/push/infrastructure/repository/ongi-push-preference.repository';
import { OngiPushPreferenceController } from '@/ongi/push/presentation/controller/ongi-push-preference.controller';
import { ONGI_PUSH_TOKEN_REPOSITORY } from '@/ongi/push/domain/repository/ongi-push-token.repository.interface';
import { OngiPushTokenRepository } from '@/ongi/push/infrastructure/repository/ongi-push-token.repository';
import { OngiPushController } from '@/ongi/push/presentation/controller/ongi-push.controller';
import {
  OngiGetPushPreferencesUseCase,
  OngiRegisterPushTokenUseCase,
  OngiUnregisterPushTokenUseCase,
  OngiUpdatePushPreferencesUseCase,
} from '@/ongi/push/application/usecase/ongi-push.usecase';
import { OngiPushService } from '@/ongi/push/application/service/ongi-push.service';
import { OngiGroupModule } from '@/ongi/group/ongi-group.module';

@Module({
  imports: [TypeOrmModule.forFeature([OngiPushToken, OngiPushPreference]), forwardRef(() => OngiGroupModule)],
  controllers: [OngiPushController, OngiPushPreferenceController],
  providers: [
    { provide: ONGI_PUSH_TOKEN_REPOSITORY, useClass: OngiPushTokenRepository },
    { provide: ONGI_PUSH_PREFERENCE_REPOSITORY, useClass: OngiPushPreferenceRepository },
    OngiRegisterPushTokenUseCase,
    OngiUnregisterPushTokenUseCase,
    OngiGetPushPreferencesUseCase,
    OngiUpdatePushPreferencesUseCase,
    OngiPushService,
  ],
  exports: [OngiPushService, ONGI_PUSH_TOKEN_REPOSITORY, ONGI_PUSH_PREFERENCE_REPOSITORY],
})
export class OngiPushModule {}
