import { InquiryRepository } from '@/system/repository/inquiry.repository';
import { CreateInquiryCommand } from '@/system/dto/command/create-inquiry.command';
import { InquiryService } from './inquiry.service';

/** 기대값: 정상 문의는 저장하고 id 를, 스팸은 저장하지 않고 0 을 돌려준다 (응답은 둘 다 성공) */
describe('InquiryService.createInquiry', () => {
  const repository = { create: jest.fn().mockResolvedValue(42) };
  const service = new InquiryService(repository as unknown as InquiryRepository);
  const command = new CreateInquiryCommand({ title: '광고 문의드립니다', contents: '배너 광고 단가가 궁금합니다.', email: 'me@example.com' });

  beforeEach(() => jest.clearAllMocks());

  it('정상 문의는 저장', async () => {
    await expect(service.createInquiry(command, { ip: '1.1.1.1', startedAt: Date.now() - 20000 })).resolves.toBe(42);
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it('스팸은 저장하지 않고 0', async () => {
    await expect(service.createInquiry(command, { ip: '1.1.1.1', website: 'x' })).resolves.toBe(0);
    await expect(service.createInquiry(new CreateInquiryCommand({ title: 'SSNFkSImLFMtqxTOrsS', contents: 'hi', email: 'bot@example.com' }), {})).resolves.toBe(
      0,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});
