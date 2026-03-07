import { Injectable } from '@nestjs/common';
import { VlExamQuestion } from '@/tov/entity/vl-exam-question.entity';
import { VlWordGroup } from '@/tov/entity/vl-word-group.entity';

@Injectable()
export class ExamGradingService {
  gradeQuestions(questions: VlExamQuestion[]): void {
    for (const question of questions) {
      if (question.isCorrect === null || question.isCorrect === undefined) {
        question.isCorrect = this.isCorrectAnswer(question);
      }
    }
  }

  countCorrectAnswers(questions: VlExamQuestion[]): number {
    return questions.filter(q => this.isCorrectAnswer(q)).length;
  }

  calculatePassStatus(questions: VlExamQuestion[], wordGroup: VlWordGroup): string {
    if (questions.length === 0) return 'FAIL';

    const totalCorrect = this.countCorrectAnswers(questions);
    const totalPercentage = this.calculatePercentage(totalCorrect, questions.length);

    if (totalPercentage < wordGroup.passPercentageTotal) return 'FAIL';

    const questionsByType = this.groupByType(questions);

    if (wordGroup.enableMeaning && !this.checkTypePercentage(
      questionsByType.get('meaning_multiple_choice'), wordGroup.passPercentageMeaning)) {
      return 'FAIL';
    }

    if (wordGroup.enableSpelling && !this.checkTypePercentage(
      questionsByType.get('spelling_subjective'), wordGroup.passPercentageSpelling)) {
      return 'FAIL';
    }

    if (wordGroup.enableSynonymAntonym) {
      const synonymAntonym = [
        ...(questionsByType.get('synonym_multiple_choice') || []),
        ...(questionsByType.get('antonym_multiple_choice') || []),
      ];
      if (!this.checkTypePercentage(synonymAntonym, wordGroup.passPercentageSynonymAntonym)) {
        return 'FAIL';
      }
    }

    if (wordGroup.enableContext && !this.checkTypePercentage(
      questionsByType.get('context_multiple_choice'), wordGroup.passPercentageContext)) {
      return 'FAIL';
    }

    return 'PASS';
  }

  private isCorrectAnswer(question: VlExamQuestion): boolean {
    if (question.isCorrect !== null && question.isCorrect !== undefined) {
      return question.isCorrect;
    }

    const userAnswer = question.userAnswer;
    const correctAnswer = question.correctAnswer;

    if (!userAnswer || !correctAnswer) return false;

    if (this.isArrayFormat(correctAnswer)) {
      return this.matchesAnyInArray(userAnswer, correctAnswer, question.questionType);
    }

    return this.matchesAnswer(userAnswer, correctAnswer, question.questionType);
  }

  private matchesAnswer(userAnswer: string, correctAnswer: string, questionType: string): boolean {
    const trimmed = userAnswer.trim();

    if (correctAnswer.toLowerCase() === trimmed.toLowerCase()) return true;

    if (questionType === 'spelling_subjective') {
      const withoutParentheses = correctAnswer.replace(/\([^)]*\)/g, '');
      if (withoutParentheses.toLowerCase() === trimmed.toLowerCase()) return true;
    }

    return false;
  }

  private isArrayFormat(value: string): boolean {
    return value.startsWith('[') && value.endsWith(']');
  }

  private matchesAnyInArray(userAnswer: string, correctAnswerArray: string, questionType: string): boolean {
    const content = correctAnswerArray.slice(1, -1);
    const answers = content.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    return answers.some(answer => this.matchesAnswer(userAnswer, answer, questionType));
  }

  private checkTypePercentage(questions: VlExamQuestion[] | undefined, requiredPercentage: number): boolean {
    if (!questions || questions.length === 0) return true;
    const correct = this.countCorrectAnswers(questions);
    return this.calculatePercentage(correct, questions.length) >= requiredPercentage;
  }

  private calculatePercentage(correct: number, total: number): number {
    if (total === 0) return 0;
    return Math.floor((correct * 100) / total);
  }

  private groupByType(questions: VlExamQuestion[]): Map<string, VlExamQuestion[]> {
    const map = new Map<string, VlExamQuestion[]>();
    for (const q of questions) {
      const list = map.get(q.questionType) || [];
      list.push(q);
      map.set(q.questionType, list);
    }
    return map;
  }
}
