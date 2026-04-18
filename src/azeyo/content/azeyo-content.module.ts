import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzeyoContentTest } from '@/azeyo/content/domain/entity/azeyo-content-test.entity';
import { AZEYO_CONTENT_TEST_REPOSITORY } from '@/azeyo/content/domain/repository/azeyo-content-test.repository.interface';
import { AzeyoContentTestRepository } from '@/azeyo/content/infrastructure/repository/azeyo-content-test.repository';
import { AzeyoScanContentTestsUseCase } from '@/azeyo/content/application/usecase/azeyo-scan-content-tests.usecase';
import { AzeyoContentController } from '@/azeyo/content/presentation/controller/azeyo-content.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AzeyoContentTest])],
  controllers: [AzeyoContentController],
  providers: [
    AzeyoScanContentTestsUseCase,
    { provide: AZEYO_CONTENT_TEST_REPOSITORY, useClass: AzeyoContentTestRepository },
  ],
})
export class AzeyoContentModule {}
