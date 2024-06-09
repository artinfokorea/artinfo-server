import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '@/common/security/jwt.strategy';
import { AuthController } from '@/auth/controller/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '@/auth/entity/auth.entity';
import { User } from '@/user/entity/user.entity';
import { AuthService } from '@/auth/service/auth.service';
import { UserRepository } from '@/user/repository/user.repository';
import { UserMajorCategoryEntity } from '@/user/entity/user-major-category.entity';
import { VerificationController } from '@/auth/controller/verification.controller';
import { VerificationService } from '@/auth/service/verificationService';
import { SystemService } from '@/system/service/system.service';
import { RedisService } from '@/common/redis/redis.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Auth, User, UserMajorCategoryEntity])],
  controllers: [AuthController, VerificationController],
  providers: [JwtService, JwtStrategy, AuthService, UserRepository, VerificationService, SystemService, RedisService],
})
export class AuthModule {}
