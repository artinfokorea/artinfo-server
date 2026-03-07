import { Injectable } from '@nestjs/common';
import { DataSource, In, Between } from 'typeorm';
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
      where: { id: userId, deletedAt: null as any },
    });
  }

  async existsInProgressExam(userId: string): Promise<boolean> {
    const count = await this.dataSource.getRepository(VlExam).count({
      where: { userId, status: 'in_progress', deletedAt: null as any },
    });
    return count > 0;
  }

  async findWordGroupById(groupId: string): Promise<VlWordGroup | null> {
    return this.dataSource.getRepository(VlWordGroup).findOne({
      where: { id: groupId, deletedAt: null as any },
    });
  }

  async findWordGroupItems(groupId: string, seqFrom: number, seqTo: number): Promise<VlWordGroupItem[]> {
    return this.dataSource.getRepository(VlWordGroupItem).find({
      where: {
        wordGroupId: groupId,
        wordSeq: Between(seqFrom, seqTo),
        deletedAt: null as any,
      },
    });
  }

  async findWordsWithDetails(masterWordIds: string[]): Promise<WordWithDetails[]> {
    if (masterWordIds.length === 0) return [];

    const [words, meanings, synonyms, antonyms, sentences] = await Promise.all([
      this.dataSource.getRepository(VlMasterWord).find({ where: { id: In(masterWordIds) } }),
      this.dataSource.getRepository(VlWordMeaning).find({
        where: { masterWordId: In(masterWordIds), deletedAt: null as any },
        order: { displayOrder: 'ASC' },
      }),
      this.dataSource.getRepository(VlWordSynonym).find({
        where: { masterWordId: In(masterWordIds), deletedAt: null as any },
      }),
      this.dataSource.getRepository(VlWordAntonym).find({
        where: { masterWordId: In(masterWordIds), deletedAt: null as any },
      }),
      this.dataSource.getRepository(VlWordExampleSentence).find({
        where: { masterWordId: In(masterWordIds), deletedAt: null as any },
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
