import { AzeyoContentTest } from '@/azeyo/content/domain/entity/azeyo-content-test.entity';

export const AZEYO_CONTENT_TEST_REPOSITORY = Symbol('AZEYO_CONTENT_TEST_REPOSITORY');

export interface IAzeyoContentTestRepository {
  findActiveTests(): Promise<AzeyoContentTest[]>;
  findBySlug(slug: string): Promise<AzeyoContentTest | null>;
}
