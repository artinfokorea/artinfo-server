import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import { SystemModule } from '@/system/module/system.module';
import { OnchurchMasterController } from '@/onchurch/master/presentation/controller/onchurch-master.controller';
import { OnchurchEnqueueBulkEmailUseCase } from '@/onchurch/master/application/usecase/onchurch-enqueue-bulk-email.usecase';
import { OnchurchGetEmailLogUseCase } from '@/onchurch/master/application/usecase/onchurch-get-email-log.usecase';
import { OnchurchBulkEmailProcessor } from '@/onchurch/master/application/processor/onchurch-bulk-email.processor';
import { ONCHURCH_BULK_EMAIL_QUEUE } from '@/onchurch/master/application/queue/onchurch-bulk-email.queue';
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
import { OnchurchListChurchesUseCase } from '@/onchurch/master/application/usecase/onchurch-list-churches.usecase';
import { OnchurchUpdateChurchPaidUntilUseCase } from '@/onchurch/master/application/usecase/onchurch-update-church-paid-until.usecase';
import {
  OnchurchCreateLedgerEntryUseCase,
  OnchurchListLedgerEntriesUseCase,
  OnchurchDeleteLedgerEntryUseCase,
} from '@/onchurch/master/application/usecase/onchurch-ledger.usecase';
import { OnchurchEmailLog } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';
import { OnchurchEmailTemplate } from '@/onchurch/master/domain/entity/onchurch-email-template.entity';
import { OnchurchSmsLog } from '@/onchurch/master/domain/entity/onchurch-sms-log.entity';
import { OnchurchSmsTemplate } from '@/onchurch/master/domain/entity/onchurch-sms-template.entity';
import { OnchurchChurch } from '@/onchurch/church/domain/entity/onchurch-church.entity';
import { OnchurchLedgerEntry } from '@/onchurch/master/domain/entity/onchurch-ledger-entry.entity';
import { ONCHURCH_EMAIL_LOG_REPOSITORY } from '@/onchurch/master/domain/repository/onchurch-email-log.repository.interface';
import { ONCHURCH_EMAIL_TEMPLATE_REPOSITORY } from '@/onchurch/master/domain/repository/onchurch-email-template.repository.interface';
import { ONCHURCH_SMS_LOG_REPOSITORY } from '@/onchurch/master/domain/repository/onchurch-sms-log.repository.interface';
import { ONCHURCH_SMS_TEMPLATE_REPOSITORY } from '@/onchurch/master/domain/repository/onchurch-sms-template.repository.interface';
import { ONCHURCH_CHURCH_OVERVIEW_REPOSITORY } from '@/onchurch/master/domain/repository/onchurch-church-overview.repository.interface';
import { ONCHURCH_LEDGER_REPOSITORY } from '@/onchurch/master/domain/repository/onchurch-ledger.repository.interface';
import { OnchurchEmailLogRepository } from '@/onchurch/master/infrastructure/repository/onchurch-email-log.repository';
import { OnchurchEmailTemplateRepository } from '@/onchurch/master/infrastructure/repository/onchurch-email-template.repository';
import { OnchurchSmsLogRepository } from '@/onchurch/master/infrastructure/repository/onchurch-sms-log.repository';
import { OnchurchSmsTemplateRepository } from '@/onchurch/master/infrastructure/repository/onchurch-sms-template.repository';
import { OnchurchChurchOverviewRepository } from '@/onchurch/master/infrastructure/repository/onchurch-church-overview.repository';
import { OnchurchLedgerRepository } from '@/onchurch/master/infrastructure/repository/onchurch-ledger.repository';

@Module({
  imports: [
    OnchurchUserModule,
    SystemModule,
    TypeOrmModule.forFeature([
      OnchurchEmailLog,
      OnchurchEmailTemplate,
      OnchurchSmsLog,
      OnchurchSmsTemplate,
      OnchurchChurch,
      OnchurchLedgerEntry,
    ]),
    BullModule.registerQueue({ name: ONCHURCH_BULK_EMAIL_QUEUE }),
  ],
  controllers: [OnchurchMasterController],
  providers: [
    OnchurchEnqueueBulkEmailUseCase,
    OnchurchGetEmailLogUseCase,
    OnchurchBulkEmailProcessor,
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
    OnchurchListChurchesUseCase,
    OnchurchUpdateChurchPaidUntilUseCase,
    OnchurchCreateLedgerEntryUseCase,
    OnchurchListLedgerEntriesUseCase,
    OnchurchDeleteLedgerEntryUseCase,
    AwsSesService,
    { provide: ONCHURCH_EMAIL_LOG_REPOSITORY, useClass: OnchurchEmailLogRepository },
    { provide: ONCHURCH_EMAIL_TEMPLATE_REPOSITORY, useClass: OnchurchEmailTemplateRepository },
    { provide: ONCHURCH_SMS_LOG_REPOSITORY, useClass: OnchurchSmsLogRepository },
    { provide: ONCHURCH_SMS_TEMPLATE_REPOSITORY, useClass: OnchurchSmsTemplateRepository },
    { provide: ONCHURCH_CHURCH_OVERVIEW_REPOSITORY, useClass: OnchurchChurchOverviewRepository },
    { provide: ONCHURCH_LEDGER_REPOSITORY, useClass: OnchurchLedgerRepository },
  ],
})
export class OnchurchMasterModule {}
