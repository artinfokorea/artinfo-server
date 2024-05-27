import { Injectable } from '@nestjs/common';
import { SignUpCommand } from '@/auth/dto/command/sign-up.command';
import { UserRepository } from '@/user/repository/user.repository';
import { EmailAlreadyExist, InvalidLoginInfo } from '@/auth/exception/auth.exception';
import * as bcrypt from 'bcrypt';
import { User } from '@/user/entity/user.entity';
import { EmailLoginCommand } from '@/auth/dto/command/email-login.command';
import { Auth, AUTH_TYPE } from '@/auth/entity/auth.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private ACCESS_TOKEN_EXPIRE_IN = 1 * 60 * 60;
  private REFRESH_TOKEN_EXPIRE_IN = 2 * 30 * 24 * 60 * 60;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signup(command: SignUpCommand): Promise<void> {
    const user = await this.userRepository.findByEmail(command.email);
    if (user) throw new EmailAlreadyExist();

    const hashedPassword = await this.getHashedPassword(command.password);

    const createdUser = new User({
      name: command.name,
      email: command.email,
      password: hashedPassword,
    });

    await createdUser.save();
  }

  async emailLogin(command: EmailLoginCommand): Promise<Auth> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) throw new InvalidLoginInfo();

    const passwordMatching = await bcrypt.compare(command.password, user.password);
    if (!passwordMatching) throw new InvalidLoginInfo();

    const accessTokenExpiresIn = new Date(Date.now() + this.ACCESS_TOKEN_EXPIRE_IN * 1000);
    const refreshTokenExpiresIn = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRE_IN * 1000);

    const auth = new Auth({
      type: AUTH_TYPE.EMAIL,
      userId: user.id,
      accessToken: this.generateToken(this.ACCESS_TOKEN_EXPIRE_IN, { id: user.id, name: user.name, email: user.email }),
      accessTokenExpiresIn: accessTokenExpiresIn,
      refreshToken: this.generateToken(this.REFRESH_TOKEN_EXPIRE_IN),
      refreshTokenExpiresIn: refreshTokenExpiresIn,
    });

    await auth.save();

    return auth;
  }

  private getHashedPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
  };

  private generateToken(expiresIn: number, payload?: { id: number; name: string; email: string }): string {
    return this.jwtService.sign(
      payload ?? {}, //
      { privateKey: process.env['JWT_TOKEN_KEY'], expiresIn: expiresIn },
    );
  }
}
