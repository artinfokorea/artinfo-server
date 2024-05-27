import { Module } from '@nestjs/common';
import { UserController } from '@/user/controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entity/user.entity';
import { UserService } from '@/user/service/user.service';
import { UserRepository } from '@/user/repository/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
