import { Module } from '@nestjs/common';
import { UserController } from '@/user/controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entity/user.entity';
import { UserService } from '@/user/service/user.service';
import { UserRepository } from '@/user/repository/user.repository';
import { UserMajorCategory } from '@/user/entity/user-major-category.entity';
import { School } from '@/user/entity/school.entity';
import { SchoolRepository } from '@/user/repository/school.repository';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { Auth } from '@/auth/entity/auth.entity';
import { AuthRepository } from '@/auth/repository/auth.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([User, School, UserMajorCategory, Auth])],
  controllers: [UserController],
  providers: [UserService, UserRepository, SchoolRepository, RedisRepository, AuthRepository, JwtService],
})
export class UserModule {}
