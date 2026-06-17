import { OnchurchEmailTemplate } from '@/onchurch/master/domain/entity/onchurch-email-template.entity';

export const ONCHURCH_EMAIL_TEMPLATE_REPOSITORY = Symbol('ONCHURCH_EMAIL_TEMPLATE_REPOSITORY');

export interface IOnchurchEmailTemplateRepository {
  create(params: { ownerId: number; name: string; subject: string; content: string }): Promise<number>;
  findAll(): Promise<OnchurchEmailTemplate[]>;
  findById(id: number): Promise<OnchurchEmailTemplate | null>;
  deleteById(id: number): Promise<void>;
}
