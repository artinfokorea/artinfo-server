import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import { SystemModule } from '@/system/module/system.module';
import { OnchurchMasterController } from '@/onchurch/master/presentation/controller/onchurch-master.controller';
import { OnchurchSendBulkEmailUseCase } from '@/onchurch/master/application/usecase/onchurch-send-bulk-email.usecase';
import { OnchurchListEmailLogsUseCase } from '@/onchurch/master/application/usecase/onchurch-list-email-logs.usecase';
import { OnchurchEmailVerificationService } from '@/onchurch/master/application/service/onchurch-email-verification.service';
import {
  OnchurchCreateEmailTemplateUseCase,
  OnchurchListEmailTemplatesUseCase,
  OnchurchDeleteEmailTemplateUseCase,
} from '@/onchurch/master/application/usecase/onchurch-email-template.usecase';
import { OnchurchSendBulkSmsUseCase } from '@/onchurch/master/application/usecase/onchurch-send-bulk-sms.usecase';
import { OnchurchListSmsLogsUseCase } from '@/onchurch/master/application/usecase/onchurch-list-sms-logs.usecase';
import {
  OnchurchCreateSmsTemplateUseCase,
  OnchurchListSmsTemplatesUseCase,
  OnchurchDeleteSmsTemplateUseCase,
} from '@/onchurch/master/application/usecase/onchurch-sms-template.usecase';
import { OnchurchEmailLog } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';
import { OnchurchEmailTemplate } from '@/onchurch/master/domain/entity/onchurch-email-template.entity';
import { OnchurchSmsLog } from '@/onchurch/master/domain/entity/onchurch-sms-log.entity';
import { OnchurchSmsTemplate } from '@/onchurch/master/domain/entity/onchurch-sms-template.entity';
import { ONCHURCH_EMAIL_LOG_REPOSITORY } from '@/onchurch/master/domain/repository/onchurch-email-log.repository.interface';
import { ONCHURCH_EMAIL_TEMPLATE_REPOSITORY } from '@/onchurch/master/domain/repository/onchurch-email-template.repository.interface';
import { ONCHURCH_SMS_LOG_REPOSITORY } from '@/onchurch/master/domain/repository/onchurch-sms-log.repository.interface';
import { ONCHURCH_SMS_TEMPLATE_REPOSITORY } from '@/onchurch/master/domain/repository/onchurch-sms-template.repository.interface';
import { OnchurchEmailLogRepository } from '@/onchurch/master/infrastructure/repository/onchurch-email-log.repository';
import { OnchurchEmailTemplateRepository } from '@/onchurch/master/infrastructure/repository/onchurch-email-template.repository';
import { OnchurchSmsLogRepository } from '@/onchurch/master/infrastructure/repository/onchurch-sms-log.repository';
import { OnchurchSmsTemplateRepository } from '@/onchurch/master/infrastructure/repository/onchurch-sms-template.repository';

@Module({
  imports: [
    OnchurchUserModule,
    SystemModule,
    TypeOrmModule.forFeature([OnchurchEmailLog, OnchurchEmailTemplate, OnchurchSmsLog, OnchurchSmsTemplate]),
  ],
  controllers: [OnchurchMasterController],
  providers: [
    OnchurchSendBulkEmailUseCase,
    OnchurchListEmailLogsUseCase,
    OnchurchEmailVerificationService,
    OnchurchCreateEmailTemplateUseCase,
    OnchurchListEmailTemplatesUseCase,
    OnchurchDeleteEmailTemplateUseCase,
    OnchurchSendBulkSmsUseCase,
    OnchurchListSmsLogsUseCase,
    OnchurchCreateSmsTemplateUseCase,
    OnchurchListSmsTemplatesUseCase,
    OnchurchDeleteSmsTemplateUseCase,
    AwsSesService,
    { provide: ONCHURCH_EMAIL_LOG_REPOSITORY, useClass: OnchurchEmailLogRepository },
    { provide: ONCHURCH_EMAIL_TEMPLATE_REPOSITORY, useClass: OnchurchEmailTemplateRepository },
    { provide: ONCHURCH_SMS_LOG_REPOSITORY, useClass: OnchurchSmsLogRepository },
    { provide: ONCHURCH_SMS_TEMPLATE_REPOSITORY, useClass: OnchurchSmsTemplateRepository },
  ],
})
export class OnchurchMasterModule {}
