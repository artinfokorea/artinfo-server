import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchSmsTemplateRepository } from '@/onchurch/master/domain/repository/onchurch-sms-template.repository.interface';
import { OnchurchSmsTemplate } from '@/onchurch/master/domain/entity/onchurch-sms-template.entity';

@Injectable()
export class OnchurchSmsTemplateRepository implements IOnchurchSmsTemplateRepository {
  constructor(
    @InjectRepository(OnchurchSmsTemplate)
    private readonly templateRepository: Repository<OnchurchSmsTemplate>,
  ) {}

  async create(params: { ownerId: number; name: string; subject: string; content: string }): Promise<number> {
    const template = await this.templateRepository.save(params);
    return template.id;
  }

  async findAll(): Promise<OnchurchSmsTemplate[]> {
    return this.templateRepository.find({ order: { createdAt: 'DESC', id: 'DESC' } });
  }

  async findById(id: number): Promise<OnchurchSmsTemplate | null> {
    return this.templateRepository.findOneBy({ id });
  }

  async deleteById(id: number): Promise<void> {
    await this.templateRepository.delete({ id });
  }
}
