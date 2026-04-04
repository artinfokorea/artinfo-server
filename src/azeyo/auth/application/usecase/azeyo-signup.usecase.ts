import { Inject, Injectable } from '@nestjs/common';
import { AZEYO_USER_REPOSITORY, IAzeyoUserRepository } from '@/azeyo/user/domain/repository/azeyo-user.repository.interface';
import { AZEYO_AUTH_REPOSITORY, IAzeyoAuthRepository } from '@/azeyo/auth/domain/repository/azeyo-auth.repository.interface';
import { AZEYO_SNS_CLIENT, IAzeyoSnsClient } from '@/azeyo/sns/domain/service/azeyo-sns-client.interface';
import { AZEYO_SCHEDULE_REPOSITORY, IAzeyoScheduleRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule.repository.interface';
import { AZEYO_SCHEDULE_TAG_REPOSITORY, IAzeyoScheduleTagRepository } from '@/azeyo/schedule/domain/repository/azeyo-schedule-tag.repository.interface';
import { AzeyoAuth, AZEYO_AUTH_TYPE, AZEYO_SNS_TYPE } from '@/azeyo/auth/domain/entity/azeyo-auth.entity';
import { AZEYO_SCHEDULE_REPEAT_TYPE } from '@/azeyo/schedule/domain/entity/azeyo-schedule.entity';
import { AzeyoSignupCommand } from '@/azeyo/auth/application/command/azeyo-signup.command';
import { AzeyoNicknameAlreadyExist } from '@/azeyo/user/domain/exception/azeyo-user.exception';
import { AzeyoMaleOnlyService } from '@/azeyo/auth/domain/exception/azeyo-auth.exception';

@Injectable()
export class AzeyoSignupUseCase {
  constructor(
    @Inject(AZEYO_USER_REPOSITORY)
    private readonly userRepository: IAzeyoUserRepository,

    @Inject(AZEYO_AUTH_REPOSITORY)
    private readonly authRepository: IAzeyoAuthRepository,

    @Inject(AZEYO_SNS_CLIENT)
    private readonly snsClient: IAzeyoSnsClient,

    @Inject(AZEYO_SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: IAzeyoScheduleRepository,

    @Inject(AZEYO_SCHEDULE_TAG_REPOSITORY)
    private readonly tagRepository: IAzeyoScheduleTagRepository,
  ) {}

  async execute(command: AzeyoSignupCommand): Promise<AzeyoAuth> {
    // 남성만 가입 가능 (테스트: 모든 유저 차단)
    throw new AzeyoMaleOnlyService();

    /* eslint-disable no-unreachable */
    const nicknameExists = await this.userRepository.existsByNickname(command.nickname);
    if (nicknameExists) throw new AzeyoNicknameAlreadyExist();

    const snsUserInfo = await this.snsClient.getUserInfo(command.snsToken, command.snsType as AZEYO_SNS_TYPE);

    const existingUser = await this.userRepository.findBySnsId(command.snsType, snsUserInfo.snsId);
    if (existingUser) {
      return await this.authRepository.create({ type: command.snsType as AZEYO_AUTH_TYPE, userId: existingUser!.id }, existingUser!);
    }

    const randomProfileNumber = Math.floor(Math.random() * 12) + 1;
    const defaultIconUrl = `https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/${randomProfileNumber}.jpg`;

    const userId = await this.userRepository.create({
      nickname: command.nickname,
      marriageDate: command.marriageDate,
      children: command.children,
      gender: snsUserInfo.gender,
      ageRange: snsUserInfo.ageRange,
      birthDate: this.combineBirthDate(snsUserInfo.birthyear, snsUserInfo.birthday),
      phone: snsUserInfo.phone,
      email: snsUserInfo.email,
      snsType: command.snsType,
      snsId: snsUserInfo.snsId,
      iconImageUrl: snsUserInfo.iconImageUrl || defaultIconUrl,
      marketingConsent: command.marketingConsent,
    });

    // 자동 일정 등록 (내 생일, 결혼기념일) - 실패해도 회원가입은 진행
    try {
      const birthDate = this.combineBirthDate(snsUserInfo.birthyear, snsUserInfo.birthday);
      await this.createAutoSchedules(userId, command.marriageDate, birthDate);
    } catch (e) {
      console.error('[Signup] 자동 일정 등록 실패:', e);
    }

    const user = await this.userRepository.findOneOrThrowById(userId);

    return await this.authRepository.create({ type: command.snsType as AZEYO_AUTH_TYPE, userId: user.id }, user);
  }

  private combineBirthDate(birthyear: string | null, birthday: string | null): string | null {
    if (!birthyear || !birthday) return null;
    // birthday from Kakao: "MMDD"
    const month = birthday.substring(0, 2);
    const day = birthday.substring(2, 4);
    return `${birthyear}-${month}-${day}`;
  }

  private async createAutoSchedules(
    userId: number,
    marriageDate: string | null,
    birthDate: string | null,
  ): Promise<void> {
    const allTags = await this.tagRepository.findSystemAndUserTags(userId);
    const thisYear = new Date().getFullYear();

    // 내 생일 일정
    if (birthDate) {
      const [, month, day] = birthDate.split('-');
      const birthdayTag = allTags.find(t => t.name === '내 생일' && t.isSystem);
      const tags = birthdayTag ? [birthdayTag] : [];

      await this.scheduleRepository.create({
        userId,
        title: '내 생일',
        date: `${thisYear}-${month}-${day}`,
        memo: null,
        repeatType: AZEYO_SCHEDULE_REPEAT_TYPE.YEARLY,
        startDate: birthDate,
        tags,
      });
    }

    // 결혼기념일 일정
    if (marriageDate) {
      const [, month, day] = marriageDate.split('-');
      const anniversaryTag = allTags.find(t => t.name === '결혼기념일' && t.isSystem);
      const tags = anniversaryTag ? [anniversaryTag] : [];

      await this.scheduleRepository.create({
        userId,
        title: '결혼기념일',
        date: `${thisYear}-${month}-${day}`,
        memo: null,
        repeatType: AZEYO_SCHEDULE_REPEAT_TYPE.YEARLY,
        startDate: marriageDate,
        tags,
      });
    }
  }
}
