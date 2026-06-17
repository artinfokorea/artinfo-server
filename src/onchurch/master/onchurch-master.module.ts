import { Module } from '@nestjs/common';
import { OnchurchUserModule } from '@/onchurch/user/onchurch-user.module';
import { AwsSesService } from '@/aws/ses/aws-ses.service';
import { OnchurchMasterController } from '@/onchurch/master/presentation/controller/onchurch-master.controller';
import { OnchurchSendBulkEmailUseCase } from '@/onchurch/master/application/usecase/onchurch-send-bulk-email.usecase';

@Module({
  imports: [OnchurchUserModule],
  controllers: [OnchurchMasterController],
  providers: [OnchurchSendBulkEmailUseCase, AwsSesService],
})
export class OnchurchMasterModule {}
