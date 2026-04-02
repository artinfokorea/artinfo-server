import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzeyoJokboTemplate } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';
import { AzeyoJokboLike } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-like.entity';
import { AzeyoJokboController } from '@/azeyo/jokbo/presentation/controller/azeyo-jokbo.controller';
import { AZEYO_JOKBO_TEMPLATE_REPOSITORY } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-template.repository.interface';
import { AZEYO_JOKBO_LIKE_REPOSITORY } from '@/azeyo/jokbo/domain/repository/azeyo-jokbo-like.repository.interface';
import { AzeyoJokboTemplateRepository } from '@/azeyo/jokbo/infrastructure/repository/azeyo-jokbo-template.repository';
import { AzeyoJokboLikeRepository } from '@/azeyo/jokbo/infrastructure/repository/azeyo-jokbo-like.repository';
import { AzeyoCreateJokboTemplateUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-create-jokbo-template.usecase';
import { AzeyoScanJokboTemplatesUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-scan-jokbo-templates.usecase';
import { AzeyoScanMyJokboTemplatesUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-scan-my-jokbo-templates.usecase';
import { AzeyoLikeJokboTemplateUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-like-jokbo-template.usecase';
import { AzeyoCopyJokboTemplateUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-copy-jokbo-template.usecase';
import { AzeyoEditJokboTemplateUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-edit-jokbo-template.usecase';
import { AzeyoDeleteJokboTemplateUseCase } from '@/azeyo/jokbo/application/usecase/azeyo-delete-jokbo-template.usecase';
import { AzeyoUser } from '@/azeyo/user/domain/entity/azeyo-user.entity';
import { AzeyoUserModule } from '@/azeyo/user/azeyo-user.module';
import { AzeyoNotificationModule } from '@/azeyo/notification/azeyo-notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([AzeyoJokboTemplate, AzeyoJokboLike, AzeyoUser]), forwardRef(() => AzeyoUserModule), AzeyoNotificationModule],
  controllers: [AzeyoJokboController],
  providers: [
    // UseCases
    AzeyoCreateJokboTemplateUseCase,
    AzeyoScanJokboTemplatesUseCase,
    AzeyoScanMyJokboTemplatesUseCase,
    AzeyoLikeJokboTemplateUseCase,
    AzeyoCopyJokboTemplateUseCase,
    AzeyoEditJokboTemplateUseCase,
    AzeyoDeleteJokboTemplateUseCase,
    // Repositories
    { provide: AZEYO_JOKBO_TEMPLATE_REPOSITORY, useClass: AzeyoJokboTemplateRepository },
    { provide: AZEYO_JOKBO_LIKE_REPOSITORY, useClass: AzeyoJokboLikeRepository },
  ],
  exports: [AZEYO_JOKBO_TEMPLATE_REPOSITORY, AZEYO_JOKBO_LIKE_REPOSITORY],
})
export class AzeyoJokboModule {}
