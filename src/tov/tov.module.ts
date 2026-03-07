import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TovController } from '@/tov/controller/tov.controller';
import { TovService } from '@/tov/service/tov.service';
import { TovRepository } from '@/tov/repository/tov.repository';
import { ExamQuestionGenerator } from '@/tov/service/exam-question.generator';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { VlExam } from '@/tov/entity/vl-exam.entity';
import { VlExamQuestion } from '@/tov/entity/vl-exam-question.entity';
import { VlUser } from '@/tov/entity/vl-user.entity';
import { VlWordGroup } from '@/tov/entity/vl-word-group.entity';
import { VlWordGroupItem } from '@/tov/entity/vl-word-group-item.entity';
import { VlMasterWord } from '@/tov/entity/vl-master-word.entity';
import { VlWordMeaning } from '@/tov/entity/vl-word-meaning.entity';
import { VlWordSynonym } from '@/tov/entity/vl-word-synonym.entity';
import { VlWordAntonym } from '@/tov/entity/vl-word-antonym.entity';
import { VlWordExampleSentence } from '@/tov/entity/vl-word-example-sentence.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VlExam,
      VlExamQuestion,
      VlUser,
      VlWordGroup,
      VlWordGroupItem,
      VlMasterWord,
      VlWordMeaning,
      VlWordSynonym,
      VlWordAntonym,
      VlWordExampleSentence,
    ]),
  ],
  controllers: [TovController],
  providers: [TovService, TovRepository, ExamQuestionGenerator, RedisRepository],
})
export class TovModule {}
