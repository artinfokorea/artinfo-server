import { Injectable } from '@nestjs/common';
import { VlWordGroup } from '@/tov/entity/vl-word-group.entity';
import { WordWithDetails } from '@/tov/dto/word-with-details';
import { VlExamQuestion } from '@/tov/entity/vl-exam-question.entity';

enum QuestionType {
  MEANING_MULTIPLE_CHOICE = 'meaning_multiple_choice',
  SPELLING_SUBJECTIVE = 'spelling_subjective',
  SYNONYM_MULTIPLE_CHOICE = 'synonym_multiple_choice',
  ANTONYM_MULTIPLE_CHOICE = 'antonym_multiple_choice',
  CONTEXT_MULTIPLE_CHOICE = 'context_multiple_choice',
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

@Injectable()
export class ExamQuestionGenerator {
  generate(group: VlWordGroup, words: WordWithDetails[], requestedSize: number): Partial<VlExamQuestion>[] {
    const enabledTypes = this.getEnabledTypes(group);
    if (enabledTypes.length === 0 || words.length === 0) return [];

    const totalQuestions = Math.min(requestedSize, words.length);
    const typeAllocation = this.allocateQuestionTypes(enabledTypes, totalQuestions, words);

    return this.generateQuestions(words, typeAllocation);
  }

  private getEnabledTypes(group: VlWordGroup): QuestionType[] {
    const types: QuestionType[] = [];
    if (group.enableMeaning) types.push(QuestionType.MEANING_MULTIPLE_CHOICE);
    if (group.enableSpelling) types.push(QuestionType.SPELLING_SUBJECTIVE);
    if (group.enableSynonymAntonym) {
      types.push(QuestionType.SYNONYM_MULTIPLE_CHOICE);
      types.push(QuestionType.ANTONYM_MULTIPLE_CHOICE);
    }
    if (group.enableContext) types.push(QuestionType.CONTEXT_MULTIPLE_CHOICE);
    return types;
  }

  private allocateQuestionTypes(
    enabledTypes: QuestionType[],
    totalQuestions: number,
    words: WordWithDetails[],
  ): Map<QuestionType, number> {
    const allocation = new Map<QuestionType, number>(enabledTypes.map(t => [t, 0]));

    const wordsWithSynonym = words.filter(w => w.synonyms.length > 0).length;
    const wordsWithAntonym = words.filter(w => w.antonyms.length > 0).length;
    const wordsWithContext = words.filter(w => w.exampleSentences.length > 0).length;

    const hasSynonymAntonym =
      enabledTypes.includes(QuestionType.SYNONYM_MULTIPLE_CHOICE) ||
      enabledTypes.includes(QuestionType.ANTONYM_MULTIPLE_CHOICE);

    const categoryTypes = enabledTypes.filter(t => t !== QuestionType.ANTONYM_MULTIPLE_CHOICE);
    const categoryCount = categoryTypes.length;

    const baseAllocation = Math.floor(totalQuestions / categoryCount);
    const remainder = totalQuestions % categoryCount;

    const fallbackTypes = enabledTypes.filter(
      t => t === QuestionType.MEANING_MULTIPLE_CHOICE || t === QuestionType.SPELLING_SUBJECTIVE,
    );

    let shortfall = 0;
    let categoryIndex = 0;

    for (const type of enabledTypes) {
      if (type === QuestionType.ANTONYM_MULTIPLE_CHOICE) continue;

      const count = baseAllocation + (categoryIndex < remainder ? 1 : 0);
      categoryIndex++;

      if (type === QuestionType.SYNONYM_MULTIPLE_CHOICE && hasSynonymAntonym) {
        const synonymCount = Math.floor(count / 2);
        const antonymCount = count - synonymCount;

        const actualSynonym = Math.min(synonymCount, wordsWithSynonym);
        const actualAntonym = Math.min(antonymCount, wordsWithAntonym);

        allocation.set(QuestionType.SYNONYM_MULTIPLE_CHOICE, actualSynonym);
        allocation.set(QuestionType.ANTONYM_MULTIPLE_CHOICE, actualAntonym);
        shortfall += (synonymCount - actualSynonym) + (antonymCount - actualAntonym);
      } else {
        const maxAvailable = type === QuestionType.CONTEXT_MULTIPLE_CHOICE ? wordsWithContext : words.length;
        const actualCount = Math.min(count, maxAvailable);
        allocation.set(type, actualCount);
        shortfall += count - actualCount;
      }
    }

    if (shortfall > 0 && fallbackTypes.length > 0) {
      const perFallback = Math.floor(shortfall / fallbackTypes.length);
      const fallbackRemainder = shortfall % fallbackTypes.length;

      fallbackTypes.forEach((type, i) => {
        const additional = perFallback + (i < fallbackRemainder ? 1 : 0);
        allocation.set(type, (allocation.get(type) || 0) + additional);
      });
    }

    return allocation;
  }

  private generateQuestions(
    words: WordWithDetails[],
    typeAllocation: Map<QuestionType, number>,
  ): Partial<VlExamQuestion>[] {
    const questions: Partial<VlExamQuestion>[] = [];
    const usedWordIds = new Set<string>();
    const shuffledWords = shuffle(words);

    const wordPoolByType = new Map<QuestionType, WordWithDetails[]>([
      [QuestionType.SYNONYM_MULTIPLE_CHOICE, shuffledWords.filter(w => w.synonyms.length > 0)],
      [QuestionType.ANTONYM_MULTIPLE_CHOICE, shuffledWords.filter(w => w.antonyms.length > 0)],
      [QuestionType.CONTEXT_MULTIPLE_CHOICE, shuffledWords.filter(w => w.exampleSentences.length > 0)],
    ]);

    for (const [type, count] of typeAllocation.entries()) {
      let remaining = count;
      const pool = wordPoolByType.get(type) || shuffledWords;

      for (const word of pool) {
        if (remaining <= 0) break;
        if (usedWordIds.has(word.masterWordId)) continue;

        const answer = this.getAnswerForType(word, type);
        if (answer === null) continue;

        const question = this.createQuestion(word, type, shuffledWords);
        if (question) {
          questions.push(question);
          usedWordIds.add(word.masterWordId);
          remaining--;
        }
      }
    }

    return questions;
  }

  private getAnswerForType(word: WordWithDetails, type: QuestionType): string | null {
    switch (type) {
      case QuestionType.MEANING_MULTIPLE_CHOICE:
        return word.meanings.length > 0 ? word.meanings[0] : null;
      case QuestionType.SPELLING_SUBJECTIVE:
        return word.englishWord;
      case QuestionType.SYNONYM_MULTIPLE_CHOICE:
        return word.synonyms.length > 0 ? word.synonyms[0] : null;
      case QuestionType.ANTONYM_MULTIPLE_CHOICE:
        return word.antonyms.length > 0 ? word.antonyms[0] : null;
      case QuestionType.CONTEXT_MULTIPLE_CHOICE:
        return word.exampleSentences.length > 0 ? word.exampleSentences[0].blankAnswer : null;
    }
  }

  private createQuestion(
    word: WordWithDetails,
    type: QuestionType,
    allWords: WordWithDetails[],
  ): Partial<VlExamQuestion> | null {
    let questionText: string;
    let correctAnswer: string;
    let options: string[] = [];

    switch (type) {
      case QuestionType.MEANING_MULTIPLE_CHOICE:
        questionText = word.englishWord;
        correctAnswer = JSON.stringify(word.meanings);
        options = this.generateMeaningOptions(word, allWords, word.meanings[0]);
        break;
      case QuestionType.SPELLING_SUBJECTIVE:
        questionText = word.meanings.length > 0 ? word.meanings[0] : '';
        correctAnswer = JSON.stringify([word.englishWord, ...word.synonyms]);
        break;
      case QuestionType.SYNONYM_MULTIPLE_CHOICE:
        questionText = word.englishWord;
        correctAnswer = word.synonyms[0];
        options = this.generateWordOptions(word, allWords, correctAnswer);
        break;
      case QuestionType.ANTONYM_MULTIPLE_CHOICE:
        questionText = word.englishWord;
        correctAnswer = word.antonyms[0];
        options = this.generateWordOptions(word, allWords, correctAnswer);
        break;
      case QuestionType.CONTEXT_MULTIPLE_CHOICE:
        questionText = word.exampleSentences[0].sentenceWithBlank;
        correctAnswer = word.exampleSentences[0].blankAnswer;
        options = this.generateWordOptions(word, allWords, correctAnswer);
        break;
      default:
        return null;
    }

    return {
      masterWordId: word.masterWordId,
      questionType: type,
      questionNumber: 0,
      questionText,
      correctAnswer,
      option1: options[0] || null,
      option2: options[1] || null,
      option3: options[2] || null,
      option4: options[3] || null,
      option5: options[4] || null,
    };
  }

  private generateMeaningOptions(word: WordWithDetails, allWords: WordWithDetails[], correctAnswer: string): string[] {
    const options = [correctAnswer];
    const otherMeanings = allWords
      .filter(w => w.masterWordId !== word.masterWordId)
      .flatMap(w => w.meanings)
      .filter(m => m !== correctAnswer);

    const unique = [...new Set(otherMeanings)];
    const shuffled = shuffle(unique);

    for (const meaning of shuffled) {
      if (options.length >= 5) break;
      options.push(meaning);
    }

    return shuffle(options);
  }

  private generateWordOptions(word: WordWithDetails, allWords: WordWithDetails[], correctAnswer: string): string[] {
    const options = [correctAnswer];
    const otherWords = allWords
      .filter(w => w.masterWordId !== word.masterWordId)
      .map(w => w.englishWord)
      .filter(w => w !== correctAnswer);

    const unique = [...new Set(otherWords)];
    const shuffled = shuffle(unique);

    for (const w of shuffled) {
      if (options.length >= 5) break;
      options.push(w);
    }

    return shuffle(options);
  }
}
