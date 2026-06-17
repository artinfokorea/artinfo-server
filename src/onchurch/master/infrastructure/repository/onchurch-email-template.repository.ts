import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchEmailTemplateRepository } from '@/onchurch/master/domain/repository/onchurch-email-template.repository.interface';
import { OnchurchEmailTemplate } from '@/onchurch/master/domain/entity/onchurch-email-template.entity';

@Injectable()
export class OnchurchEmailTemplateRepository implements IOnchurchEmailTemplateRepository {
  constructor(
    @InjectRepository(OnchurchEmailTemplate)
    private readonly templateRepository: Repository<OnchurchEmailTemplate>,
  ) {}

  async create(params: { ownerId: number; name: string; subject: string; content: string }): Promise<number> {
    const template = await this.templateRepository.save(params);
    return template.id;
  }

  async findAll(): Promise<OnchurchEmailTemplate[]> {
    return this.templateRepository.find({ order: { createdAt: 'DESC', id: 'DESC' } });
  }

  async findById(id: number): Promise<OnchurchEmailTemplate | null> {
    return this.templateRepository.findOneBy({ id });
  }

  async deleteById(id: number): Promise<void> {
    await this.templateRepository.delete({ id });
  }
}
