import { Inject, Injectable } from '@nestjs/common';
import {
  AZEYO_CONTENT_TEST_REPOSITORY,
  IAzeyoContentTestRepository,
} from '@/azeyo/content/domain/repository/azeyo-content-test.repository.interface';
import { AzeyoContentTest } from '@/azeyo/content/domain/entity/azeyo-content-test.entity';

@Injectable()
export class AzeyoScanContentTestsUseCase {
  constructor(
    @Inject(AZEYO_CONTENT_TEST_REPOSITORY)
    private readonly testRepository: IAzeyoContentTestRepository,
  ) {}

  async execute(): Promise<AzeyoContentTest[]> {
    return this.testRepository.findActiveTests();
  }
}
