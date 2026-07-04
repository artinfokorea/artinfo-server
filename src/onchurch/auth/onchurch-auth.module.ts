import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { ONCHURCH_AUTH_REPOSITORY } from '@/onchurch/auth/domain/repository/onchurch-auth.repository.interface';
import { OnchurchAuthRepository } from '@/onchurch/auth/infrastructure/repository/onchurch-auth.repository';
import { OnchurchAuthController } from '@/onchurch/auth/presentation/controller/onchurch-auth.controller';
import { OnchurchSignupUseCase } from '@/onchurch/auth/application/usecase/onchurch-signup.usecase';
import { OnchurchCheckLoginIdUseCase } from '@/onchurch/auth/application/usecase/onchurch-check-login-id.usecase';
import { OnchurchLoginUseCase } from '@/onchurch/auth/application/usecase/onchurch-login.usecase';
import { OnchurchRefreshTokensUseCase } from '@/onchurch/auth/application/usecase/onchurch-refresh-tokens.usecase';
import { OnchurchSendVerificationUseCase } from '@/onchurch/auth/application/usecase/onchurch-send-verification.usecase';
import { OnchurchVerifyCodeUseCase } from '@/onchurch/auth/application/usecase/onchurch-verify-code.usecase';
import { OnchurchFindLoginIdsUseCase } from '@/onchurch/auth/application/usecase/onchurch-find-login-ids.usecase';
import { OnchurchResetPasswordUseCase } from '@/onchurch/auth/application/usecase/onchurch-reset-password.usecase';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { OnchurchChurchModule } from '@/onchurch/church/onchurch-church.module';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { SystemModule } from '@/system/module/system.module';
import { AwsSesService } from '@/aws/ses/aws-ses.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([OnchurchAuth]), OnchurchUserModule, OnchurchChurchModule, SystemModule],
  controllers: [OnchurchAuthController],
  providers: [
    JwtService,
    OnchurchSignupUseCase,
    OnchurchCheckLoginIdUseCase,
    OnchurchLoginUseCase,
    OnchurchRefreshTokensUseCase,
    OnchurchSendVerificationUseCase,
    OnchurchVerifyCodeUseCase,
    OnchurchFindLoginIdsUseCase,
    OnchurchResetPasswordUseCase,
    { provide: ONCHURCH_AUTH_REPOSITORY, useClass: OnchurchAuthRepository },
    RedisRepository,
    AwsSesService,
  ],
})
export class OnchurchAuthModule {}
