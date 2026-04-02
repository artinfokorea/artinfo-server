import { AzeyoJokboLike } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-like.entity';

export const AZEYO_JOKBO_LIKE_REPOSITORY = Symbol('AZEYO_JOKBO_LIKE_REPOSITORY');

export interface IAzeyoJokboLikeRepository {
  findByTemplateIdAndUserId(templateId: number, userId: number): Promise<AzeyoJokboLike | null>;
  save(like: Partial<AzeyoJokboLike>): Promise<AzeyoJokboLike>;
  softRemove(like: AzeyoJokboLike): Promise<void>;
  findManyByTemplateIdsAndUserId(templateIds: number[], userId: number): Promise<AzeyoJokboLike[]>;
  countByTemplateIds(templateIds: number[]): Promise<{ templateId: number; count: number }[]>;
}
