import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { ONCHURCH_AUTH_REPOSITORY } from '@/onchurch/auth/domain/repository/onchurch-auth.repository.interface';
import { OnchurchAuthRepository } from '@/onchurch/auth/infrastructure/repository/onchurch-auth.repository';
import { OnchurchAuthController } from '@/onchurch/auth/presentation/controller/onchurch-auth.controller';
import { OnchurchSignupUseCase } from '@/onchurch/auth/application/usecase/onchurch-signup.usecase';
import { OnchurchLoginUseCase } from '@/onchurch/auth/application/usecase/onchurch-login.usecase';
import { OnchurchRefreshTokensUseCase } from '@/onchurch/auth/application/usecase/onchurch-refresh-tokens.usecase';
import { OnchurchSendVerificationUseCase } from '@/onchurch/auth/application/usecase/onchurch-send-verification.usecase';
import { OnchurchVerifyCodeUseCase } from '@/onchurch/auth/application/usecase/onchurch-verify-code.usecase';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { SystemModule } from '@/system/module/system.module';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([OnchurchAuth]), OnchurchUserModule, SystemModule],
  controllers: [OnchurchAuthController],
  providers: [
    JwtService,
    OnchurchSignupUseCase,
    OnchurchLoginUseCase,
    OnchurchRefreshTokensUseCase,
    OnchurchSendVerificationUseCase,
    OnchurchVerifyCodeUseCase,
    { provide: ONCHURCH_AUTH_REPOSITORY, useClass: OnchurchAuthRepository },
    RedisRepository,
  ],
})
export class OnchurchAuthModule {}
