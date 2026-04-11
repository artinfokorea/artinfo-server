import { Injectable } from '@nestjs/common';
import { DataSource, In, Between, IsNull } from 'typeorm';
import { ExamGradingService } from '@/tov/service/exam-grading.service';
import { VlUser } from '@/tov/entity/vl-user.entity';
import { VlExam } from '@/tov/entity/vl-exam.entity';
import { VlExamQuestion } from '@/tov/entity/vl-exam-question.entity';
import { VlWordGroup } from '@/tov/entity/vl-word-group.entity';
import { VlWordGroupItem } from '@/tov/entity/vl-word-group-item.entity';
import { VlMasterWord } from '@/tov/entity/vl-master-word.entity';
import { VlWordMeaning } from '@/tov/entity/vl-word-meaning.entity';
import { VlWordSynonym } from '@/tov/entity/vl-word-synonym.entity';
import { VlWordAntonym } from '@/tov/entity/vl-word-antonym.entity';
import { VlWordExampleSentence } from '@/tov/entity/vl-word-example-sentence.entity';
import { WordWithDetails } from '@/tov/dto/word-with-details';

@Injectable()
export class TovRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findUserById(userId: string): Promise<VlUser | null> {
    return this.dataSource.getRepository(VlUser).findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
  }

  async existsInProgressExam(userId: string): Promise<boolean> {
    const count = await this.dataSource.getRepository(VlExam).count({
      where: { userId, status: 'in_progress', deletedAt: IsNull() },
    });
    return count > 0;
  }

  async findWordGroupById(groupId: string): Promise<VlWordGroup | null> {
    return this.dataSource.getRepository(VlWordGroup).findOne({
      where: { id: groupId, deletedAt: IsNull() },
    });
  }

  async findWordGroupItems(groupId: string, seqFrom: number, seqTo: number): Promise<VlWordGroupItem[]> {
    return this.dataSource.getRepository(VlWordGroupItem).find({
      where: {
        wordGroupId: groupId,
        wordSeq: Between(seqFrom, seqTo),
        deletedAt: IsNull(),
      },
    });
  }

  async findWordsWithDetails(masterWordIds: string[]): Promise<WordWithDetails[]> {
    if (masterWordIds.length === 0) return [];

    const [words, meanings, synonyms, antonyms, sentences] = await Promise.all([
      this.dataSource.getRepository(VlMasterWord).find({ where: { id: In(masterWordIds) } }),
      this.dataSource.getRepository(VlWordMeaning).find({
        where: { masterWordId: In(masterWordIds), deletedAt: IsNull() },
        order: { displayOrder: 'ASC' },
      }),
      this.dataSource.getRepository(VlWordSynonym).find({
        where: { masterWordId: In(masterWordIds), deletedAt: IsNull() },
      }),
      this.dataSource.getRepository(VlWordAntonym).find({
        where: { masterWordId: In(masterWordIds), deletedAt: IsNull() },
      }),
      this.dataSource.getRepository(VlWordExampleSentence).find({
        where: { masterWordId: In(masterWordIds), deletedAt: IsNull() },
      }),
    ]);

    return words.map(word => ({
      masterWordId: word.id,
      englishWord: word.englishWord,
      meanings: meanings.filter(m => m.masterWordId === word.id).map(m => m.koreanMeaning),
      synonyms: synonyms.filter(s => s.masterWordId === word.id).map(s => s.synonym),
      antonyms: antonyms.filter(a => a.masterWordId === word.id).map(a => a.antonym),
      exampleSentences: sentences
        .filter(e => e.masterWordId === word.id)
        .map(e => ({ sentenceWithBlank: e.sentenceWithBlank, blankAnswer: e.blankAnswer })),
    }));
  }

  async findExpiredInProgressExams(expiredMinutes: number): Promise<VlExam[]> {
    const expiredTime = new Date(Date.now() - expiredMinutes * 60 * 1000).toISOString();

    return this.dataSource.getRepository(VlExam)
      .createQueryBuilder('exam')
      .where('exam.status = :status', { status: 'in_progress' })
      .andWhere('exam.started_at IS NOT NULL')
      .andWhere('exam.started_at < :expiredTime', { expiredTime })
      .andWhere('exam.deleted_at IS NULL')
      .getMany();
  }

  async gradeExam(examId: string, gradingService: ExamGradingService): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const exam = await manager.findOneOrFail(VlExam, { where: { id: examId } });
      const questions = await manager.find(VlExamQuestion, {
        where: { examId, deletedAt: IsNull() },
      });
      const wordGroup = await manager.findOneOrFail(VlWordGroup, {
        where: { id: exam.wordGroupId },
      });

      gradingService.gradeQuestions(questions);
      await manager.save(VlExamQuestion, questions);

      const correctAnswers = gradingService.countCorrectAnswers(questions);
      const passStatus = gradingService.calculatePassStatus(questions, wordGroup);

      exam.correctAnswers = correctAnswers;
      exam.passStatus = passStatus;
      exam.status = 'completed';
      exam.completedAt = new Date();
      await manager.save(VlExam, exam);
    });
  }

  async saveExamWithQuestions(
    exam: Partial<VlExam>,
    questions: Partial<VlExamQuestion>[],
  ): Promise<string> {
    return this.dataSource.transaction(async manager => {
      const savedExam = await manager.save(VlExam, exam);

      const questionsWithExamId = questions.map(q => ({ ...q, examId: savedExam.id }));
      await manager.save(VlExamQuestion, questionsWithExamId);

      return savedExam.id;
    });
  }
}
