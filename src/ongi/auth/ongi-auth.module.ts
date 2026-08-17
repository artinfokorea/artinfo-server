import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiAuth } from '@/ongi/auth/domain/entity/ongi-auth.entity';
import { ONGI_AUTH_REPOSITORY } from '@/ongi/auth/domain/repository/ongi-auth.repository.interface';
import { OngiAuthRepository } from '@/ongi/auth/infrastructure/repository/ongi-auth.repository';
import { ONGI_SNS_CLIENT } from '@/ongi/auth/domain/service/ongi-sns-client.interface';
import { OngiSnsClientService } from '@/ongi/auth/infrastructure/service/ongi-sns-client.service';
import { OngiAuthController } from '@/ongi/auth/presentation/controller/ongi-auth.controller';
import { OngiSnsLoginUseCase } from '@/ongi/auth/application/usecase/ongi-sns-login.usecase';
import { OngiRefreshTokensUseCase } from '@/ongi/auth/application/usecase/ongi-refresh-tokens.usecase';
import { OngiUserModule } from '@/ongi/user/ongi-user.module';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([OngiAuth]), OngiUserModule],
  controllers: [OngiAuthController],
  providers: [
    JwtService,
    OngiSnsLoginUseCase,
    OngiRefreshTokensUseCase,
    { provide: ONGI_AUTH_REPOSITORY, useClass: OngiAuthRepository },
    { provide: ONGI_SNS_CLIENT, useClass: OngiSnsClientService },
    RedisRepository,
  ],
})
export class OngiAuthModule {}
