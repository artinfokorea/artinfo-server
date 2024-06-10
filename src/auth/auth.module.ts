import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '@/common/security/jwt.strategy';
import { AuthController } from '@/auth/controller/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '@/auth/entity/auth.entity';
import { User } from '@/user/entity/user.entity';
import { AuthService } from '@/auth/service/auth.service';
import { UserRepository } from '@/user/repository/user.repository';
import { UserMajorCategory } from '@/user/entity/user-major.category';
import { VerificationController } from '@/auth/controller/verification.controller';
import { VerificationService } from '@/auth/service/verificationService';
import { SystemService } from '@/system/service/system.service';
import { RedisService } from '@/common/redis/redis.service';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { ImageRepository } from '@/system/repository/image.repository';
import { Image } from '@/system/entity/image.entity';
import { AwsSesService } from '@/aws/ses/aws-ses.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Auth, User, UserMajorCategory, Image])],
  controllers: [AuthController, VerificationController],
  providers: [
    JwtService,
    JwtStrategy,
    AuthService,
    UserRepository,
    VerificationService,
    SystemService,
    RedisService,
    AwsS3Service,
    AwsSesService,
    ImageRepository,
  ],
})
export class AuthModule {}
