import { Injectable, Logger } from '@nestjs/common';
import { CreateExamRequest } from '@/tov/dto/request/create-exam.request';
import { TovRepository } from '@/tov/repository/tov.repository';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { ExamQuestionGenerator } from '@/tov/service/exam-question.generator';
import { RedisSetCommand } from '@/common/redis/dto/redis-set.command';
import { TovUserNotFound, TovExamInProgress, TovWordNotFoundInRange, TovNoQuestionsGenerated, TovWordGroupNotFound } from '@/tov/exception/tov.exception';
import { VlExamQuestion } from '@/tov/entity/vl-exam-question.entity';

const CACHE_TTL = 600; // 10분

@Injectable()
export class TovService {
  private readonly logger = new Logger(TovService.name);

  constructor(
    private readonly tovRepository: TovRepository,
    private readonly redisRepository: RedisRepository,
    private readonly examQuestionGenerator: ExamQuestionGenerator,
  ) {}

  async createExam(request: CreateExamRequest): Promise<string> {
    const user = await this.tovRepository.findUserById(request.userId);
    if (!user) throw new TovUserNotFound();

    const inProgress = await this.tovRepository.existsInProgressExam(request.userId);
    if (inProgress) throw new TovExamInProgress();

    let questionTemplates = await this.getQuestionsTemplate(request);

    if (questionTemplates.length === 0) {
      this.logger.log('[Cache] 빈 캐시 감지 - 캐시 삭제 후 재생성 시도');
      await this.evictQuestionsTemplate(request);
      questionTemplates = await this.getQuestionsTemplate(request);
    }

    this.logger.log(`[Cache] 문제 템플릿 조회 완료 - ${questionTemplates.length}개 문제`);

    if (questionTemplates.length === 0) {
      throw new TovNoQuestionsGenerated();
    }

    const shuffled = this.shuffle(questionTemplates);
    this.moveSpellingAwayFromLast(shuffled);

    const numberedQuestions: Partial<VlExamQuestion>[] = shuffled.map((q, i) => ({
      ...q,
      questionNumber: i + 1,
    }));

    return this.tovRepository.saveExamWithQuestions(
      {
        userId: request.userId,
        wordGroupId: request.groupId,
        startChapterNumber: request.chapterFrom,
        startStepNumber: request.stepFrom ?? null,
        endChapterNumber: request.chapterTo,
        endStepNumber: request.stepTo ?? null,
        totalQuestions: numberedQuestions.length,
        status: 'in_progress',
        correctAnswers: 0,
      },
      numberedQuestions,
    );
  }

  private buildCacheKey(request: CreateExamRequest): string {
    return `examQuestions:${request.groupId}_${request.chapterFrom}_${request.chapterTo}_${request.stepFrom ?? 'null'}_${request.stepTo ?? 'null'}_${request.size}`;
  }

  private async getQuestionsTemplate(request: CreateExamRequest): Promise<Partial<VlExamQuestion>[]> {
    const cacheKey = this.buildCacheKey(request);
    const cached = await this.redisRepository.getByKey(cacheKey);
    if (cached) return cached;

    this.logger.log(
      `[Cache MISS] 문제 템플릿 새로 생성 - groupId: ${request.groupId}, chapter: ${request.chapterFrom}-${request.chapterTo}, step: ${request.stepFrom}-${request.stepTo}, size: ${request.size}`,
    );

    const group = await this.tovRepository.findWordGroupById(request.groupId);
    if (!group) throw new TovWordGroupNotFound();

    const seqFrom = request.chapterFrom * 1000 + (request.stepFrom ?? 0);
    const seqTo = request.chapterTo * 1000 + (request.stepTo ?? 999);

    const items = await this.tovRepository.findWordGroupItems(request.groupId, seqFrom, seqTo);
    if (items.length === 0) throw new TovWordNotFoundInRange();

    const masterWordIds = items.map(item => item.masterWordId);
    const words = await this.tovRepository.findWordsWithDetails(masterWordIds);

    const actualSize = Math.min(request.size, words.length);
    const templates = this.examQuestionGenerator.generate(group, words, actualSize);

    if (templates.length > 0) {
      await this.redisRepository.setValue(new RedisSetCommand({ key: cacheKey, value: templates, ttl: CACHE_TTL }));
    }

    return templates;
  }

  private async evictQuestionsTemplate(request: CreateExamRequest): Promise<void> {
    const cacheKey = this.buildCacheKey(request);
    this.logger.log(`[Cache EVICT] 문제 템플릿 캐시 삭제 - ${cacheKey}`);
    await this.redisRepository.delete(cacheKey);
  }

  private shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private moveSpellingAwayFromLast(questions: Partial<VlExamQuestion>[]): void {
    if (questions.length < 2) return;

    const lastIndex = questions.length - 1;
    const lastQuestion = questions[lastIndex];

    if (lastQuestion.questionType !== 'spelling_subjective') return;

    for (let i = 0; i < lastIndex; i++) {
      if (questions[i].questionType !== 'spelling_subjective') {
        [questions[i], questions[lastIndex]] = [questions[lastIndex], questions[i]];
        return;
      }
    }
  }
}
