import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_AUTH_REPOSITORY, IOnchurchAuthRepository } from '@/onchurch/auth/domain/repository/onchurch-auth.repository.interface';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchSignupWithChurchCommand } from '@/onchurch/auth/application/command/onchurch-signup-with-church.command';
import { OnchurchPhoneNotVerified, OnchurchUserIdAlreadyExist } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { SystemService } from '@/system/service/system.service';
import { OnchurchUpsertMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-upsert-my-church.usecase';
import { OnchurchPublishMyChurchUseCase } from '@/onchurch/church/application/usecase/onchurch-publish-my-church.usecase';
import { OnchurchUpsertMyChurchCommand } from '@/onchurch/church/application/command/onchurch-upsert-my-church.command';
import { OnchurchUpsertMyPastorUseCase } from '@/onchurch/about/application/usecase/onchurch-pastor.usecase';
import { OnchurchPastorWriteCommand } from '@/onchurch/about/application/command/onchurch-about-write.command';
import { OnchurchCreateMyWorshipServiceUseCase } from '@/onchurch/worship/application/usecase/onchurch-worship-service.usecase';
import { OnchurchWorshipServiceWriteCommand } from '@/onchurch/worship/application/command/onchurch-worship-write.command';

const WELCOME_SMS_SUBJECT = '[온교회] 가입을 환영합니다';

// 신규 교회의 기본 활성 페이지 — 관리자 첫 저장 시 전부 ON 되는 것과 동일하게 맞춘다.
const DEFAULT_ENABLED_PAGES = [
  'about',
  'worship',
  'sermons',
  'notices',
  'schedule',
  'gallery',
  'community',
  'prayer',
  'directions',
  'about-vision',
  'about-history',
  'about-staff',
];

@Injectable()
export class OnchurchSignupWithChurchUseCase {
  private readonly BCRYPT_ROUNDS = 10;
  private readonly logger = new Logger(OnchurchSignupWithChurchUseCase.name);

  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    @Inject(ONCHURCH_AUTH_REPOSITORY)
    private readonly authRepository: IOnchurchAuthRepository,

    private readonly redisRepository: RedisRepository,

    private readonly systemService: SystemService,

    private readonly upsertChurchUseCase: OnchurchUpsertMyChurchUseCase,
    private readonly publishChurchUseCase: OnchurchPublishMyChurchUseCase,
    private readonly upsertPastorUseCase: OnchurchUpsertMyPastorUseCase,
    private readonly createWorshipServiceUseCase: OnchurchCreateMyWorshipServiceUseCase,
  ) {}

  async execute(command: OnchurchSignupWithChurchCommand): Promise<OnchurchAuth> {
    const verifiedKey = `onchurch:verified:${command.phone}`;
    const isPhoneVerified = await this.redisRepository.getByKey(verifiedKey);
    if (!isPhoneVerified) throw new OnchurchPhoneNotVerified();

    // 아이디(=서브도메인) 중복 확인. 교회 slug 중복은 upsert 단계에서 재확인된다.
    const loginIdExists = await this.userRepository.existsByLoginId(command.slug);
    if (loginIdExists) throw new OnchurchUserIdAlreadyExist();

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, this.BCRYPT_ROUNDS);

    // 계정 생성: 아이디=slug, 이름=교회이름, 임시비밀번호. 무료체험은 첫 공개(publish) 시점에 부여된다.
    const userId = await this.userRepository.create({
      loginId: command.slug,
      password: hashedPassword,
      name: command.churchName,
      phone: command.phone,
      role: ONCHURCH_USER_ROLE.ADMIN,
      churchName: null,
      churchId: null,
      marketingConsent: false,
      freeTrialUntil: null,
      referralSource: null,
      referralSourceEtc: null,
    });

    await this.redisRepository.delete(verifiedKey);

    // 교회 기본정보 + 연락처 (여기서 OWNER 승격) → 담임목사 → 대표 예배 순으로 저장한다.
    await this.upsertChurchUseCase.execute(userId, this.buildChurchCommand(command));
    await this.upsertPastorUseCase.execute(userId, this.buildPastorCommand(command));
    await this.createWorshipServiceUseCase.execute(userId, this.buildWorshipCommand(command));

    // 필수 4단계가 모두 채워졌으므로 자동 공개 → 7일 무료체험 즉시 시작.
    await this.publishChurchUseCase.execute(userId, true);

    const user = await this.userRepository.findOneOrThrowById(userId);

    // 가입자 본인에게 아이디·임시비밀번호를 문자로 발송한다. 실패해도 가입은 통과시킨다.
    try {
      await this.systemService.sendSMS(user.phone, this.buildWelcomeSms(command.slug, user.loginId, tempPassword), WELCOME_SMS_SUBJECT);
    } catch (err) {
      this.logger.error(`가입 환영 문자 발송 실패: userId=${user.id}`, err as any);
    }

    return await this.authRepository.create({ userId: user.id }, user);
  }

  private buildChurchCommand(command: OnchurchSignupWithChurchCommand): OnchurchUpsertMyChurchCommand {
    return new OnchurchUpsertMyChurchCommand({
      slug: command.slug,
      name: command.churchName,
      eng: null,
      tagline: null,
      phone: command.churchPhone,
      email: command.email,
      address: command.address,
      representative: null,
      businessNo: null,
      logoUrl: null,
      youtubeUrl: null,
      instagramUrl: null,
      liveUrl: null,
      isLive: false,
      enabledPages: DEFAULT_ENABLED_PAGES,
      homeSectionOrder: [],
      homeQuickLinks: [],
    });
  }

  private buildPastorCommand(command: OnchurchSignupWithChurchCommand): OnchurchPastorWriteCommand {
    return new OnchurchPastorWriteCommand({
      name: command.pastorName,
      role: null,
      eng: null,
      message: null,
      longMessage: null,
      photoUrl: null,
    });
  }

  private buildWorshipCommand(command: OnchurchSignupWithChurchCommand): OnchurchWorshipServiceWriteCommand {
    return new OnchurchWorshipServiceWriteCommand({
      tag: 'WEEK',
      name: command.worshipName,
      time: command.worshipTime,
      meta: null,
      isFeatured: true,
      sortOrder: 0,
      isActive: true,
    });
  }

  // 영문 대소문자 + 숫자 10자리 임시비밀번호.
  private generateTempPassword(): string {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pw = '';
    for (let i = 0; i < 10; i += 1) pw += charset[randomInt(charset.length)];
    return pw;
  }

  private buildWelcomeSms(slug: string, loginId: string, tempPassword: string): string {
    return `안녕하세요. 온교회입니다.

온교회에 가입해 주셔서 감사합니다! 7일 무료체험이 시작되었습니다.

▶ 로그인 정보
· 아이디: ${loginId}
· 임시 비밀번호: ${tempPassword}
로그인 후 마이페이지에서 비밀번호를 변경해 주세요.

▶ 우리 교회 홈페이지
https://${slug}.everychurch.co.kr

▶ 관리자 콘솔
https://everychurch.co.kr/admin

궁금한 점은 언제든 문의해 주세요.
http://pf.kakao.com/_slJXX/chat

감사합니다.
온교회 드림`;
  }
}
