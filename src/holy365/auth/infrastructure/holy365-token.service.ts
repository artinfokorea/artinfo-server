import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Holy365Auth } from '@/holy365/auth/domain/entity/holy365-auth.entity';
import { Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';
import { HOLY365_TOKEN_SERVICE } from '@/holy365/common/holy365-auth.guard';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

const ACCESS_TOKEN_SECONDS = 60 * 60; // 1시간
const REFRESH_TOKEN_SECONDS = 60 * 24 * 60 * 60; // 60일
/** refresh token 은 남은 기간이 이보다 짧을 때만 새로 바꾼다 — 동시에 여러 탭이 갱신해도 서로 무효화하지 않게 */
const REFRESH_ROTATE_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class Holy365TokenService {
  constructor(@InjectRepository(Holy365Auth) private readonly repository: Repository<Holy365Auth>) {}

  async issue(user: Holy365User): Promise<Holy365Auth> {
    return this.repository.save({ userId: user.id, ...this.signAccess(user), ...this.signRefresh() });
  }

  async refresh(refreshToken: string, loadUser: (id: number) => Promise<Holy365User | null>): Promise<Holy365Auth> {
    try {
      jwt.verify(refreshToken, this.key());
    } catch {
      throw Holy365Errors.invalidRefresh();
    }

    const auth = await this.repository.findOneBy({ refreshToken });
    if (!auth) throw Holy365Errors.invalidRefresh();

    const user = await loadUser(auth.userId);
    if (!user) throw Holy365Errors.invalidRefresh();

    const rotate = auth.refreshTokenExpiresIn.getTime() - Date.now() < REFRESH_ROTATE_SECONDS * 1000;
    Object.assign(auth, this.signAccess(user), rotate ? this.signRefresh() : {});

    return this.repository.save(auth);
  }

  async revoke(refreshToken: string): Promise<void> {
    await this.repository.delete({ refreshToken });
  }

  private signAccess(user: Holy365User) {
    const accessToken = jwt.sign({ id: user.id, name: user.name, svc: HOLY365_TOKEN_SERVICE }, this.key(), { expiresIn: ACCESS_TOKEN_SECONDS });

    return { accessToken, accessTokenExpiresIn: new Date(Date.now() + ACCESS_TOKEN_SECONDS * 1000) };
  }

  private signRefresh() {
    // jti 가 없으면 같은 초에 발급한 토큰이 똑같아진다 (refresh_token 은 유니크)
    const refreshToken = jwt.sign({ svc: HOLY365_TOKEN_SERVICE, jti: randomUUID() }, this.key(), { expiresIn: REFRESH_TOKEN_SECONDS });

    return { refreshToken, refreshTokenExpiresIn: new Date(Date.now() + REFRESH_TOKEN_SECONDS * 1000) };
  }

  private key(): string {
    return process.env['JWT_TOKEN_KEY']!;
  }
}
