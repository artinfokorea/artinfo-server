import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzeyoAuth } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { AZEYO_AUTH_REPOSITORY } from '@/azeyo/auth/domain/repository/azeyo-auth.repository.interface';
import { AzeyoAuthRepository } from '@/azeyo/auth/infrastructure/repository/azeyo-auth.repository';
import { AzeyoAuthController } from '@/azeyo/auth/presentation/controller/azeyo-auth.controller';
import { AzeyoSignupUseCase } from '@/azeyo/auth/application/usecase/azeyo-signup.usecase';
import { AzeyoSnsLoginUseCase } from '@/azeyo/auth/application/usecase/azeyo-sns-login.usecase';
import { AzeyoRefreshTokensUseCase } from '@/azeyo/auth/application/usecase/azeyo-refresh-tokens.usecase';
import { AzeyoUserModule } from '@/azeyo/user/azeyo-user.module';
import { AzeyoSnsModule } from '@/azeyo/sns/azeyo-sns.module';
import { RedisRepository } from '@/common/redis/redis-repository.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([AzeyoAuth]), AzeyoUserModule, AzeyoSnsModule],
  controllers: [AzeyoAuthController],
  providers: [
    JwtService,
    AzeyoSignupUseCase,
    AzeyoSnsLoginUseCase,
    AzeyoRefreshTokensUseCase,
    { provide: AZEYO_AUTH_REPOSITORY, useClass: AzeyoAuthRepository },
    RedisRepository,
  ],
})
export class AzeyoAuthModule {}
