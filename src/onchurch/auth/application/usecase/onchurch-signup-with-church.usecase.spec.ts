import { OnchurchSignupWithChurchUseCase } from '@/onchurch/auth/application/usecase/onchurch-signup-with-church.usecase';
import { OnchurchSignupWithChurchCommand } from '@/onchurch/auth/application/command/onchurch-signup-with-church.command';

// 랜딩 통합 가입: 계정을 만든 뒤 교회·담임목사·예배·공개 중 하나라도 실패하면
// 방금 만든 계정과 교회 데이터를 모두 지워야 한다. 그래야 같은 서브도메인으로 다시 가입할 수 있다.
// 휴대폰 인증 표시도 남겨 두어 다시 인증하지 않고 바로 재시도할 수 있어야 한다.

const NEW_USER_ID = 77;

function makeCommand(): OnchurchSignupWithChurchCommand {
  return new OnchurchSignupWithChurchCommand({
    slug: 'grace',
    churchName: '은혜교회',
    phone: '01012345678',
    churchPhone: '02-123-4567',
    email: 'a@b.kr',
    address: '서울',
    pastorName: '홍길동',
    worshipName: '주일예배',
    worshipTime: '오전 11시',
    referralCode: null,
  });
}

function makeUseCase(failAt?: 'church' | 'pastor' | 'worship' | 'publish') {
  const fail = (step: string) => (failAt === step ? jest.fn().mockRejectedValue(new Error(`${step} 실패`)) : jest.fn().mockResolvedValue(undefined));
  const userRepository = {
    existsByLoginId: jest.fn().mockResolvedValue(false),
    create: jest.fn().mockResolvedValue(NEW_USER_ID),
    findOneOrThrowById: jest.fn().mockResolvedValue({ id: NEW_USER_ID, loginId: 'grace', phone: '01012345678' }),
    purgeFailedSignup: jest.fn().mockResolvedValue(undefined),
  };
  const authRepository = { create: jest.fn().mockResolvedValue({ accessToken: 'a' }) };
  const redisRepository = { getByKey: jest.fn().mockResolvedValue('1'), delete: jest.fn().mockResolvedValue(undefined) };
  const systemService = { sendSMS: jest.fn().mockResolvedValue(undefined) };
  const upsertChurch = { execute: fail('church') };
  const publish = { execute: fail('publish') };
  const pastor = { execute: fail('pastor') };
  const worship = { execute: fail('worship') };
  const referral = { execute: jest.fn() };
  const useCase = new OnchurchSignupWithChurchUseCase(
    userRepository as any,
    authRepository as any,
    redisRepository as any,
    systemService as any,
    upsertChurch as any,
    publish as any,
    pastor as any,
    worship as any,
    referral as any,
  );
  return { useCase, userRepository, redisRepository, systemService };
}

describe('OnchurchSignupWithChurchUseCase — 중간 실패 시 정리', () => {
  it.each(['church', 'pastor', 'worship', 'publish'] as const)('%s 단계가 실패하면 만든 계정을 지우고 에러를 그대로 던진다', async step => {
    const { useCase, userRepository, systemService } = makeUseCase(step);
    await expect(useCase.execute(makeCommand())).rejects.toThrow(`${step} 실패`);
    expect(userRepository.purgeFailedSignup).toHaveBeenCalledWith(NEW_USER_ID);
    expect(systemService.sendSMS).not.toHaveBeenCalled();
  });

  it('실패하면 휴대폰 인증 표시를 지우지 않는다 (다시 인증 없이 재시도)', async () => {
    const { useCase, redisRepository } = makeUseCase('church');
    await expect(useCase.execute(makeCommand())).rejects.toThrow();
    expect(redisRepository.delete).not.toHaveBeenCalled();
  });

  it('성공하면 계정을 지우지 않고 휴대폰 인증 표시를 지운다', async () => {
    const { useCase, userRepository, redisRepository } = makeUseCase();
    await useCase.execute(makeCommand());
    expect(userRepository.purgeFailedSignup).not.toHaveBeenCalled();
    expect(redisRepository.delete).toHaveBeenCalledWith('onchurch:verified:01012345678');
  });

  it('정리마저 실패해도 원래 에러를 던진다', async () => {
    const { useCase, userRepository } = makeUseCase('pastor');
    userRepository.purgeFailedSignup.mockRejectedValue(new Error('정리 실패'));
    await expect(useCase.execute(makeCommand())).rejects.toThrow('pastor 실패');
  });
});
