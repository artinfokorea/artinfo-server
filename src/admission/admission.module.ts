import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admission } from '@/admission/entity/admission.entity';
import { AdmissionRound } from '@/admission/entity/admission-round.entity';
import { AdmissionRoundTask } from '@/admission/entity/admission-round-task.entity';
import { MajorCategory } from '@/job/entity/major-category.entity';
import { AdmissionController } from '@/admission/controller/admission.controller';
import { AdmissionService } from '@/admission/service/admission.service';
import { AdmissionGptService } from '@/admission/service/admission-gpt.service';
import { AdmissionRepository } from '@/admission/repository/admission.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admission, AdmissionRound, AdmissionRoundTask, MajorCategory]),
  ],
  controllers: [AdmissionController],
  providers: [AdmissionService, AdmissionGptService, AdmissionRepository],
})
export class AdmissionModule {}
