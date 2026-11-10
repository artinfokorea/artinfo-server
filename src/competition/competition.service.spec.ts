import { CompetitionNotAllowed, CompetitionNotFound, CompetitionNotPublished } from './competition.exception';
import { CompetitionRepository } from './competition.repository';
import { CompetitionService } from './competition.service';
import { CompetitionRow } from './competition.types';

/**
 * 기대값
 * 1) findOne: 게시된 공고는 누구나 보고 조회수가 오른다. 검토 중 공고는 등록자 또는 관리자만 (조회수 안 오름), 그 외는 NotPublished. 없으면 NotFound
 * 2) create: 일반 회원은 REVIEW, 관리자는 PUBLISHED 로 저장되고 source 는 OWNER
 * 3) update/remove: 등록자 본인 또는 관리자만, 아니면 NotAllowed, 없으면 NotFound
 * 4) publish: 관리자만 (아니면 NotAllowed), 없으면 NotFound, 있으면 PUBLISHED 로
 */
describe('CompetitionService', () => {
  const repository = {
    findById: jest.fn(),
    isAdmin: jest.fn(),
    increaseViewCount: jest.fn().mockResolvedValue(undefined),
    create: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
    softDelete: jest.fn().mockResolvedValue(undefined),
    updateStatus: jest.fn().mockResolvedValue(undefined),
    findDuplicates: jest.fn().mockResolvedValue([]),
    attachSource: jest.fn().mockResolvedValue(undefined),
  };
  const service = new CompetitionService(repository as unknown as CompetitionRepository);
  const row = (over: Partial<CompetitionRow> = {}) => ({ id: 1, status: 'PUBLISHED', user_id: 7, ...over }) as CompetitionRow;
  const input = { title: '제13회 수원시전국음악콩쿠르', host: '(사)한국음악협회 수원시지부', closeAt: '2026-11-25' } as never;

  beforeEach(() => jest.clearAllMocks());

  it('findOne — 게시된 공고는 누구나, 조회수 +1', async () => {
    repository.findById.mockResolvedValue(row());
    await expect(service.findOne(1, null)).resolves.toMatchObject({ id: 1 });
    expect(repository.increaseViewCount).toHaveBeenCalledWith(1);
  });

  it('findOne — 검토 중 공고는 등록자·관리자만', async () => {
    repository.findById.mockResolvedValue(row({ status: 'REVIEW' }));
    repository.isAdmin.mockResolvedValue(false);
    await expect(service.findOne(1, null)).rejects.toBeInstanceOf(CompetitionNotPublished);
    await expect(service.findOne(1, 8)).rejects.toBeInstanceOf(CompetitionNotPublished);
    await expect(service.findOne(1, 7)).resolves.toMatchObject({ status: 'REVIEW' });
    repository.isAdmin.mockResolvedValue(true);
    await expect(service.findOne(1, 8)).resolves.toMatchObject({ status: 'REVIEW' });
    expect(repository.increaseViewCount).not.toHaveBeenCalled();
    repository.findById.mockResolvedValue(null);
    await expect(service.findOne(2, 7)).rejects.toBeInstanceOf(CompetitionNotFound);
  });

  it('create — 회원은 REVIEW, 관리자는 PUBLISHED', async () => {
    repository.isAdmin.mockResolvedValueOnce(false);
    repository.create.mockResolvedValueOnce(10);
    await expect(service.create(7, input)).resolves.toEqual({ id: 10, status: 'REVIEW' });
    expect(repository.create).toHaveBeenLastCalledWith(input, { userId: 7, status: 'REVIEW', source: 'OWNER' });
    repository.isAdmin.mockResolvedValueOnce(true);
    repository.create.mockResolvedValueOnce(11);
    await expect(service.create(1, input)).resolves.toEqual({ id: 11, status: 'PUBLISHED' });
  });

  it('update/remove — 본인 또는 관리자만', async () => {
    repository.findById.mockResolvedValue(row());
    repository.isAdmin.mockResolvedValue(false);
    await expect(service.update(1, 8, input)).rejects.toBeInstanceOf(CompetitionNotAllowed);
    await expect(service.remove(1, 8)).rejects.toBeInstanceOf(CompetitionNotAllowed);
    await service.update(1, 7, input);
    expect(repository.update).toHaveBeenCalledWith(1, input);
    repository.isAdmin.mockResolvedValue(true);
    await service.remove(1, 8);
    expect(repository.softDelete).toHaveBeenCalledWith(1);
    repository.findById.mockResolvedValue(null);
    await expect(service.update(5, 7, input)).rejects.toBeInstanceOf(CompetitionNotFound);
  });

  it('publish — 관리자만 PUBLISHED 로', async () => {
    repository.isAdmin.mockResolvedValueOnce(false);
    await expect(service.publish(1, 7)).rejects.toBeInstanceOf(CompetitionNotAllowed);
    repository.isAdmin.mockResolvedValue(true);
    repository.findById.mockResolvedValueOnce(null);
    await expect(service.publish(1, 1)).rejects.toBeInstanceOf(CompetitionNotFound);
    repository.findById.mockResolvedValueOnce(row({ status: 'REVIEW' }));
    await service.publish(1, 1);
    expect(repository.updateStatus).toHaveBeenCalledWith(1, 'PUBLISHED');
  });

  it('create — 같은 대회의 수집본을 숨기고 원문·포스터를 붙인다 (직접 등록본끼리는 건드리지 않음)', async () => {
    repository.isAdmin.mockResolvedValueOnce(false);
    repository.create.mockResolvedValueOnce(20);
    repository.findDuplicates.mockResolvedValueOnce([
      { id: 5, source: 'CRAWL', status: 'PUBLISHED', source_url: 'https://contest.co.kr/contest/view1/23151', poster_url: 'https://img/p.jpg' },
      { id: 6, source: 'OWNER', status: 'PUBLISHED', source_url: null, poster_url: null },
    ]);
    await service.create(7, input);
    expect(repository.findDuplicates).toHaveBeenCalledWith('수원시전국음악콩쿠르|한국음악협회수원시지부', '2026-11-25', 20);
    expect(repository.updateStatus).toHaveBeenCalledWith(5, 'HIDDEN');
    expect(repository.updateStatus).not.toHaveBeenCalledWith(6, 'HIDDEN');
    expect(repository.attachSource).toHaveBeenCalledWith(20, 'https://contest.co.kr/contest/view1/23151', 'https://img/p.jpg');
  });
});
