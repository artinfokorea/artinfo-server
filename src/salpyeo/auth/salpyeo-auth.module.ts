import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalpyeoAuth } from '@/salpyeo/auth/domain/entity/salpyeo-auth.entity';
import { SALPYEO_AUTH_REPOSITORY } from '@/salpyeo/auth/domain/repository/salpyeo-auth.repository.interface';
import { SalpyeoAuthRepository } from '@/salpyeo/auth/infrastructure/repository/salpyeo-auth.repository';
import { SalpyeoAuthMemoryRepository } from '@/salpyeo/auth/infrastructure/repository/salpyeo-auth.memory.repository';
import { SALPYEO_SNS_CLIENT } from '@/salpyeo/auth/domain/service/salpyeo-sns-client.interface';
import { SalpyeoSnsClientService } from '@/salpyeo/auth/infrastructure/service/salpyeo-sns-client.service';
import { SalpyeoTokenIssuer } from '@/salpyeo/auth/infrastructure/service/salpyeo-token.issuer';
import { SalpyeoSnsLoginUseCase } from '@/salpyeo/auth/application/usecase/salpyeo-sns-login.usecase';
import { SalpyeoRefreshTokensUseCase } from '@/salpyeo/auth/application/usecase/salpyeo-refresh-tokens.usecase';
import { SalpyeoAuthController } from '@/salpyeo/auth/presentation/controller/salpyeo-auth.controller';
import { SalpyeoUserModule } from '@/salpyeo/user/salpyeo-user.module';
import { isSalpyeoMemoryRepository } from '@/salpyeo/common/salpyeo-repository-mode';

@Module({
  imports: [JwtModule.register({}), SalpyeoUserModule, ...(isSalpyeoMemoryRepository() ? [] : [TypeOrmModule.forFeature([SalpyeoAuth])])],
  controllers: [SalpyeoAuthController],
  providers: [
    SalpyeoTokenIssuer,
    SalpyeoSnsLoginUseCase,
    SalpyeoRefreshTokensUseCase,
    { provide: SALPYEO_SNS_CLIENT, useClass: SalpyeoSnsClientService },
    { provide: SALPYEO_AUTH_REPOSITORY, useClass: isSalpyeoMemoryRepository() ? SalpyeoAuthMemoryRepository : SalpyeoAuthRepository },
  ],
})
export class SalpyeoAuthModule {}
