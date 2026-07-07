import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ONCHURCH_USER_REPOSITORY, IOnchurchUserRepository } from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_AUTH_REPOSITORY, IOnchurchAuthRepository } from '@/onchurch/auth/domain/repository/onchurch-auth.repository.interface';
import { ONCHURCH_CHURCH_REPOSITORY, IOnchurchChurchRepository } from '@/onchurch/church/domain/repository/onchurch-church.repository.interface';
import { OnchurchAuth } from '@/onchurch/auth/domain/entity/onchurch-auth.entity';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import { OnchurchSignupCommand } from '@/onchurch/auth/application/command/onchurch-signup.command';
import { OnchurchPhoneNotVerified, OnchurchUserIdAlreadyExist } from '@/onchurch/auth/domain/exception/onchurch-auth.exception';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import { ONCHURCH_MAIL_FROM } from '@/onchurch/onchurch-mail.constant';
import { SystemService } from '@/system/service/system.service';

const SIGNUP_NOTIFY_TO = 'chorales@naver.com';

// 랜딩 가입(교회 운영자) 시 가입자 본인에게 발송하는 환영 문자.
const WELCOME_SMS_SUBJECT = '[온교회] 가입을 환영합니다';
const buildWelcomeSmsContent = (loginId: string, password: string): string => `안녕하세요. 온교회입니다.

온교회에 가입해 주셔서 감사합니다!

온교회는 많은 목사님들께서 직접 쉽고 빠르게 홈페이지를 구축하여 사용하고 있는 서비스입니다. 전문 지식이 없어도 누구나 손쉽게 시작하실 수 있습니다.

지금부터 7일 무료체험으로 교회 홈페이지 제작과 성도 관리 기능을 모두 이용해 보세요.

홈페이지는 약 5분이면 우리 교회에 맞게 완성할 수 있으며, 컴퓨터(PC)에서 진행하시면 더욱 편리합니다.

▶ 로그인 정보
· 아이디: ${loginId}
· 비밀번호: ${password}

▶ 지금 시작하기
https://everychurch.co.kr/admin

이용 중 궁금한 점이나 도움이 필요하시면 언제든 편하게 문의해 주세요.
http://pf.kakao.com/_slJXX/chat

감사합니다.
온교회 드림`;

@Injectable()
export class OnchurchSignupUseCase {
  private readonly BCRYPT_ROUNDS = 10;
  private readonly logger = new Logger(OnchurchSignupUseCase.name);

  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY)
    private readonly userRepository: IOnchurchUserRepository,

    @Inject(ONCHURCH_AUTH_REPOSITORY)
    private readonly authRepository: IOnchurchAuthRepository,

    @Inject(ONCHURCH_CHURCH_REPOSITORY)
    private readonly churchRepository: IOnchurchChurchRepository,

    private readonly redisRepository: RedisRepository,

    private readonly sesService: AwsSesService,

    private readonly systemService: SystemService,
  ) {}

  async execute(command: OnchurchSignupCommand): Promise<OnchurchAuth> {
    const verifiedKey = `onchurch:verified:${command.phone}`;
    const isPhoneVerified = await this.redisRepository.getByKey(verifiedKey);
    if (!isPhoneVerified) throw new OnchurchPhoneNotVerified();

    const loginIdExists = await this.userRepository.existsByLoginId(command.userId);
    if (loginIdExists) throw new OnchurchUserIdAlreadyExist();

    const hashedPassword = await bcrypt.hash(command.password, this.BCRYPT_ROUNDS);

    // 무료체험은 가입 시점이 아니라 첫 홈페이지 공개(publish) 시점에 부여한다.
    const freeTrialUntil = null;

    // 가입 경로에 따라 역할을 구분한다.
    // - 교회 페이지에서 가입(churchSlug 있음): 성도(MEMBER), 해당 교회에 소속
    // - 랜딩 페이지에서 가입(churchSlug 없음): 교회 관리자(ADMIN), 관리 콘솔에서 교회 개설
    let churchId: number | null = null;
    let churchName: string | null = null;
    let role: ONCHURCH_USER_ROLE = ONCHURCH_USER_ROLE.ADMIN;
    if (command.churchSlug) {
      role = ONCHURCH_USER_ROLE.MEMBER;
      const church = await this.churchRepository.findBySlug(command.churchSlug);
      if (church) {
        churchId = church.id;
        churchName = church.name;
      }
    }

    const userId = await this.userRepository.create({
      loginId: command.userId,
      password: hashedPassword,
      name: command.name,
      phone: command.phone,
      role,
      churchName,
      churchId,
      marketingConsent: command.marketingConsent,
      freeTrialUntil,
      referralSource: command.referralSource,
      referralSourceEtc: command.referralSourceEtc,
    });

    const user = await this.userRepository.findOneOrThrowById(userId);

    await this.redisRepository.delete(verifiedKey);

    // 가입 알림 메일 — 운영자(교회 개설자) 가입 시에만 발송한다.
    // 성도(MEMBER) 가입은 알림 대상이 아니다. 가입 시점엔 OWNER 승격 전이라 운영자는 ADMIN 역할이다.
    // 실패해도 가입 자체는 통과시킨다.
    if (user.role !== ONCHURCH_USER_ROLE.MEMBER) {
      try {
        const referralLabelMap: Record<string, string> = { naver: '네이버', instagram: '인스타그램', mail: '메일', etc: '기타' };
        const referralLabel = referralLabelMap[user.referralSource ?? ''] ?? user.referralSource ?? '-';
        const referralText = user.referralSource === 'etc' ? `${referralLabel} (${user.referralSourceEtc ?? ''})` : referralLabel;
        const html = [
          `<h3>온교회 신규 회원 가입</h3>`,
          `<p><b>아이디</b>: ${user.loginId}</p>`,
          `<p><b>이름</b>: ${user.name}</p>`,
          `<p><b>연락처</b>: ${user.phone}</p>`,
          `<p><b>유입경로</b>: ${referralText}</p>`,
          `<p><b>마케팅 수신 동의</b>: ${user.marketingConsent ? '예' : '아니오'}</p>`,
          `<p><b>가입 일시</b>: ${new Date().toISOString()}</p>`,
        ].join('');
        await this.sesService.send(SIGNUP_NOTIFY_TO, `[온교회 가입] ${user.name}`, html, ONCHURCH_MAIL_FROM);
      } catch (err) {
        this.logger.error(`가입 알림 메일 발송 실패: userId=${user.id}`, err as any);
      }

      // 가입자 본인에게 환영 문자 발송 — 실패해도 가입은 통과시킨다.
      try {
        await this.systemService.sendSMS(user.phone, buildWelcomeSmsContent(user.loginId, command.password), WELCOME_SMS_SUBJECT);
      } catch (err) {
        this.logger.error(`가입 환영 문자 발송 실패: userId=${user.id}`, err as any);
      }
    }

    return await this.authRepository.create({ userId: user.id }, user);
  }
}
