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

const SIGNUP_NOTIFY_TO = 'chorales@naver.com';

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
  ) {}

  async execute(command: OnchurchSignupCommand): Promise<OnchurchAuth> {
    const verifiedKey = `onchurch:verified:${command.phone}`;
    const isPhoneVerified = await this.redisRepository.getByKey(verifiedKey);
    if (!isPhoneVerified) throw new OnchurchPhoneNotVerified();

    const loginIdExists = await this.userRepository.existsByLoginId(command.userId);
    if (loginIdExists) throw new OnchurchUserIdAlreadyExist();

    const hashedPassword = await bcrypt.hash(command.password, this.BCRYPT_ROUNDS);

    const FREE_TRIAL_DAYS = 7;
    const freeTrialUntil = new Date(Date.now() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);

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
    }

    return await this.authRepository.create({ userId: user.id }, user);
  }
}
