import { Injectable } from '@nestjs/common';
import { Holy365UserRepository } from '@/holy365/user/infrastructure/holy365-user.repository';
import { Holy365TokenService } from '@/holy365/auth/infrastructure/holy365-token.service';
import { Holy365OAuthClient } from '@/holy365/auth/infrastructure/holy365-oauth-client.service';
import { Holy365Auth } from '@/holy365/auth/domain/entity/holy365-auth.entity';
import { HOLY365_LOCALE, Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';
import { normalizeDisplayName, normalizeEmail } from '@/holy365/auth/domain/service/holy365-credential-policy';
import { buildAuthorizeUrl, HOLY365_SNS_PROVIDER, isAllowedRedirectUri } from '@/holy365/auth/domain/service/holy365-oauth';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

export interface Holy365LoginResult {
  user: Holy365User;
  auth: Holy365Auth;
}

export const HOLY365_DEV_TYPE = 'dev';

export function holy365WebOrigins(): string[] {
  return (process.env['HOLY365_WEB_ORIGINS'] ?? 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

export function localeOf(value: string | undefined): string {
  return value === HOLY365_LOCALE.EN ? HOLY365_LOCALE.EN : HOLY365_LOCALE.KO;
}

/** 가입·로그인은 소셜(구글·카카오·네이버)로만 — 처음 로그인하면 자동 가입 */
@Injectable()
export class Holy365AuthUseCase {
  constructor(
    private readonly userRepository: Holy365UserRepository,
    private readonly tokenService: Holy365TokenService,
    private readonly oauthClient: Holy365OAuthClient,
  ) {}

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
        name: normalizeDisplayName(profile.name) ?? (input.locale === HOLY365_LOCALE.EN ? 'Writer' : '필사자'),
        email: normalizeEmail(profile.email),
        snsType: input.provider,
        snsId: profile.snsId,
        iconImageUrl: profile.iconImageUrl,
        locale: localeOf(input.locale),
      });
    }

    return { user, auth: await this.tokenService.issue(user) };
  }

  /**
   * 로컬 개발용 로그인 — 소셜 키 없이 화면을 확인할 때. 서버 .env 에 HOLY365_DEV_LOGIN=true 를 명시했을 때만 열린다
   * (기본 차단, 배포 워크플로는 이 변수를 주입하지 않는다).
   */
  async devLogin(locale?: string): Promise<Holy365LoginResult> {
    if (process.env['HOLY365_DEV_LOGIN'] !== 'true') throw Holy365Errors.devLoginDisabled();

    let user = await this.userRepository.findBySns(HOLY365_DEV_TYPE, 'local');
    if (!user) {
      user = await this.userRepository.create({
        name: 'Dev',
        email: null,
        snsType: HOLY365_DEV_TYPE,
        snsId: 'local',
        iconImageUrl: null,
        locale: localeOf(locale),
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
