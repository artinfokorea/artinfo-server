import { OnchurchSmsTemplate } from '@/onchurch/master/domain/entity/onchurch-sms-template.entity';

export const ONCHURCH_SMS_TEMPLATE_REPOSITORY = Symbol('ONCHURCH_SMS_TEMPLATE_REPOSITORY');

export interface IOnchurchSmsTemplateRepository {
  create(params: { ownerId: number; name: string; subject: string; content: string }): Promise<number>;
  findAll(): Promise<OnchurchSmsTemplate[]>;
  findById(id: number): Promise<OnchurchSmsTemplate | null>;
  deleteById(id: number): Promise<void>;
}
