import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TovRepository } from '@/tov/repository/tov.repository';
import { ExamGradingService } from '@/tov/service/exam-grading.service';

const EXAM_EXPIRED_MINUTES = 20;

@Injectable()
export class ExamAutoGradingScheduler {
  private readonly logger = new Logger(ExamAutoGradingScheduler.name);

  constructor(
    private readonly tovRepository: TovRepository,
    private readonly examGradingService: ExamGradingService,
  ) {}

  @Cron('* * * * *', { name: 'examAutoGrading', timeZone: 'Asia/Seoul' })
  async gradeExpiredExams(): Promise<void> {
    const expiredExams = await this.tovRepository.findExpiredInProgressExams(EXAM_EXPIRED_MINUTES);

    this.logger.log(`## Found ${expiredExams.length} expired exams to grade`);

    if (expiredExams.length === 0) return;

    for (const exam of expiredExams) {
      try {
        await this.tovRepository.gradeExam(exam.id, this.examGradingService);
        this.logger.log(`Graded exam ${exam.id}`);
      } catch (e) {
        this.logger.error(`## Failed to grade exam ${exam.id}: ${(e as Error).message}`, (e as Error).stack);
      }
    }

    this.logger.log(`## Completed grading ${expiredExams.length} expired exams`);
  }
}
