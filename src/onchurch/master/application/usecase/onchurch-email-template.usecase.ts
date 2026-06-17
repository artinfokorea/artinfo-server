import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IOnchurchUserRepository,
  ONCHURCH_USER_REPOSITORY,
} from '@/onchurch/user/domain/repository/onchurch-user.repository.interface';
import { ONCHURCH_USER_ROLE } from '@/onchurch/user/domain/entity/onchurch-user.entity';
import {
  IOnchurchEmailTemplateRepository,
  ONCHURCH_EMAIL_TEMPLATE_REPOSITORY,
} from '@/onchurch/master/domain/repository/onchurch-email-template.repository.interface';
import { OnchurchEmailTemplate } from '@/onchurch/master/domain/entity/onchurch-email-template.entity';

async function assertMaster(userRepository: IOnchurchUserRepository, userId: number): Promise<void> {
  const user = await userRepository.findOneOrThrowById(userId);
  if (user.role !== ONCHURCH_USER_ROLE.MASTER) {
    throw new ForbiddenException('마스터 권한이 필요합니다.');
  }
}

@Injectable()
export class OnchurchCreateEmailTemplateUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_EMAIL_TEMPLATE_REPOSITORY) private readonly templateRepository: IOnchurchEmailTemplateRepository,
  ) {}

  async execute(userId: number, params: { name: string; subject: string; content: string }): Promise<OnchurchEmailTemplate> {
    await assertMaster(this.userRepository, userId);
    const id = await this.templateRepository.create({ ownerId: userId, ...params });
    const template = await this.templateRepository.findById(id);
    if (!template) throw new NotFoundException('템플릿 저장에 실패했습니다.');
    return template;
  }
}

@Injectable()
export class OnchurchListEmailTemplatesUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_EMAIL_TEMPLATE_REPOSITORY) private readonly templateRepository: IOnchurchEmailTemplateRepository,
  ) {}

  async execute(userId: number): Promise<OnchurchEmailTemplate[]> {
    await assertMaster(this.userRepository, userId);
    return this.templateRepository.findAll();
  }
}

@Injectable()
export class OnchurchDeleteEmailTemplateUseCase {
  constructor(
    @Inject(ONCHURCH_USER_REPOSITORY) private readonly userRepository: IOnchurchUserRepository,
    @Inject(ONCHURCH_EMAIL_TEMPLATE_REPOSITORY) private readonly templateRepository: IOnchurchEmailTemplateRepository,
  ) {}

  async execute(userId: number, id: number): Promise<void> {
    await assertMaster(this.userRepository, userId);
    const template = await this.templateRepository.findById(id);
    if (!template) throw new NotFoundException('템플릿을 찾을 수 없습니다.');
    await this.templateRepository.deleteById(id);
  }
}
