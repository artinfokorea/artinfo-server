import { AzeyoJokboTemplate, AZEYO_JOKBO_CATEGORY } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';

export const AZEYO_JOKBO_TEMPLATE_REPOSITORY = Symbol('AZEYO_JOKBO_TEMPLATE_REPOSITORY');

export interface IAzeyoJokboTemplateRepository {
  create(template: Partial<AzeyoJokboTemplate>): Promise<AzeyoJokboTemplate>;
  findOneByIdOrThrow(id: number): Promise<AzeyoJokboTemplate>;
  findOneByIdAndUserIdOrThrow(id: number, userId: number): Promise<AzeyoJokboTemplate>;
  findManyPaging(params: { skip: number; take: number; category: AZEYO_JOKBO_CATEGORY | null }): Promise<{ items: AzeyoJokboTemplate[]; totalCount: number }>;
  findManyByUserId(userId: number): Promise<AzeyoJokboTemplate[]>;
  incrementCopyCount(id: number): Promise<void>;
  softRemove(template: AzeyoJokboTemplate): Promise<void>;
  saveEntity(template: AzeyoJokboTemplate): Promise<void>;
}
