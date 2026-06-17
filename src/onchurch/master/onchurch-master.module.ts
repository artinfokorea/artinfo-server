import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import { OnchurchMasterController } from '@/onchurch/master/presentation/controller/onchurch-master.controller';
import { OnchurchSendBulkEmailUseCase } from '@/onchurch/master/application/usecase/onchurch-send-bulk-email.usecase';
import { OnchurchListEmailLogsUseCase } from '@/onchurch/master/application/usecase/onchurch-list-email-logs.usecase';
import { OnchurchEmailVerificationService } from '@/onchurch/master/application/service/onchurch-email-verification.service';
import { OnchurchEmailLog } from '@/onchurch/master/domain/entity/onchurch-email-log.entity';
import { ONCHURCH_EMAIL_LOG_REPOSITORY } from '@/onchurch/master/domain/repository/onchurch-email-log.repository.interface';
import { OnchurchEmailLogRepository } from '@/onchurch/master/infrastructure/repository/onchurch-email-log.repository';

@Module({
  imports: [OnchurchUserModule, TypeOrmModule.forFeature([OnchurchEmailLog])],
  controllers: [OnchurchMasterController],
  providers: [
    OnchurchSendBulkEmailUseCase,
    OnchurchListEmailLogsUseCase,
    OnchurchEmailVerificationService,
    AwsSesService,
    { provide: ONCHURCH_EMAIL_LOG_REPOSITORY, useClass: OnchurchEmailLogRepository },
  ],
})
export class OnchurchMasterModule {}
