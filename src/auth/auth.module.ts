import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '@/common/security/jwt.strategy';
import { AuthController } from '@/auth/controller/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '@/auth/entity/auth.entity';
import { User } from '@/user/entity/user.entity';
import { AuthService } from '@/auth/service/auth.service';
import { UserRepository } from '@/user/repository/user.repository';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Auth, User])],
  controllers: [AuthController],
  providers: [JwtService, JwtStrategy, AuthService, UserRepository],
})
export class AuthModule {}
