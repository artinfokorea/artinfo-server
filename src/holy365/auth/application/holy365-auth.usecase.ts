import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Holy365UserRepository } from '@/holy365/user/infrastructure/holy365-user.repository';
import { Holy365TokenService } from '@/holy365/auth/infrastructure/holy365-token.service';
import { Holy365OAuthClient } from '@/holy365/auth/infrastructure/holy365-oauth-client.service';
import { Holy365Auth } from '@/holy365/auth/domain/entity/holy365-auth.entity';
import { HOLY365_EMAIL_TYPE, HOLY365_LOCALE, Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';
import { isValidPassword, normalizeDisplayName, normalizeEmail } from '@/holy365/auth/domain/service/holy365-credential-policy';
import { buildAuthorizeUrl, HOLY365_SNS_PROVIDER, isAllowedRedirectUri } from '@/holy365/auth/domain/service/holy365-oauth';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

export interface Holy365LoginResult {
  user: Holy365User;
  auth: Holy365Auth;
}

const BCRYPT_ROUNDS = 10;
/** 비밀번호가 틀려도 이메일이 없어도 같은 시간만큼 걸리게 — 가입 여부를 응답 시간으로 알 수 없도록 */
const DUMMY_HASH = '$2b$10$CNdG/L5LaY4gCyefc8Rdu.COjYMGnHvebMVJEP821kHcTuZ6ucM0.';

export function holy365WebOrigins(): string[] {
  return (process.env['HOLY365_WEB_ORIGINS'] ?? 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

function localeOf(value: string | undefined): string {
  return value === HOLY365_LOCALE.ZH ? HOLY365_LOCALE.ZH : HOLY365_LOCALE.KO;
}

@Injectable()
export class Holy365AuthUseCase {
  constructor(
    private readonly userRepository: Holy365UserRepository,
    private readonly tokenService: Holy365TokenService,
    private readonly oauthClient: Holy365OAuthClient,
  ) {}

  async signup(input: { email: string; password: string; name: string; locale?: string }): Promise<Holy365LoginResult> {
    const email = normalizeEmail(input.email);
    if (!email) throw Holy365Errors.invalidEmail();
    if (!isValidPassword(input.password)) throw Holy365Errors.weakPassword();
    const name = normalizeDisplayName(input.name);
    if (!name) throw Holy365Errors.invalidName();

    if (await this.userRepository.findBySns(HOLY365_EMAIL_TYPE, email)) throw Holy365Errors.emailTaken();

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await this.userRepository
      .create({ name, email, passwordHash, snsType: HOLY365_EMAIL_TYPE, snsId: email, iconImageUrl: null, locale: localeOf(input.locale) })
      .catch(error => {
        // 동시에 같은 이메일로 가입하면 유니크 인덱스가 막는다
        if (String(error?.code) === '23505') throw Holy365Errors.emailTaken();
        throw error;
      });

    return { user, auth: await this.tokenService.issue(user) };
  }

  async login(input: { email: string; password: string }): Promise<Holy365LoginResult> {
    const email = normalizeEmail(input.email);
    const found = email ? await this.userRepository.findWithPassword(HOLY365_EMAIL_TYPE, email) : null;
    const matches = await bcrypt.compare(input.password ?? '', found?.passwordHash ?? DUMMY_HASH);
    if (!found || !matches) throw Holy365Errors.invalidCredentials();

    const user = await this.userRepository.findOneOrThrow(found.id);

    return { user, auth: await this.tokenService.issue(user) };
  }

  authorizeUrl(provider: HOLY365_SNS_PROVIDER, redirectUri: string, state: string): string {
    const credentials = this.oauthClient.credentials(provider);
    if (!credentials) throw Holy365Errors.snsNotConfigured();
    if (!isAllowedRedirectUri(redirectUri, holy365WebOrigins())) throw Holy365Errors.invalidRedirect();

    return buildAuthorizeUrl(provider, { clientId: credentials.clientId, redirectUri, state });
  }

  async snsLogin(input: { provider: HOLY365_SNS_PROVIDER; code: string; redirectUri: string; state: string; locale?: string }): Promise<Holy365LoginResult> {
    if (!isAllowedRedirectUri(input.redirectUri, holy365WebOrigins())) throw Holy365Errors.invalidRedirect();

    const profile = await this.oauthClient.fetchProfile(input.provider, input.code, input.redirectUri, input.state);

    let user = await this.userRepository.findBySns(input.provider, profile.snsId);
    if (!user) {
      user = await this.userRepository.create({
        name: normalizeDisplayName(profile.name) ?? (input.locale === HOLY365_LOCALE.ZH ? '用户' : '필사자'),
        email: normalizeEmail(profile.email),
        passwordHash: null,
        snsType: input.provider,
        snsId: profile.snsId,
        iconImageUrl: profile.iconImageUrl,
        locale: localeOf(input.locale),
      });
    }

    return { user, auth: await this.tokenService.issue(user) };
  }

  refresh(refreshToken: string): Promise<Holy365Auth> {
    return this.tokenService.refresh(refreshToken, id => this.userRepository.findById(id));
  }

  logout(refreshToken: string): Promise<void> {
    return this.tokenService.revoke(refreshToken);
  }
}
