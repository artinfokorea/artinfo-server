import { Body, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { Holy365Auth, Holy365Signature, Holy365User } from '@/holy365/common/holy365-auth.guard';
import { Holy365TranscriptionUseCase } from '@/holy365/transcription/application/holy365-transcription.usecase';
import {
  Holy365BooksProgressResponse,
  Holy365ChapterQuery,
  Holy365ChapterStateResponse,
  Holy365DailyQuery,
  Holy365DailyResponse,
  Holy365SubmitVerseRequest,
  Holy365SubmitVerseResponse,
  Holy365SummaryResponse,
  Holy365VersionQuery,
} from '@/holy365/transcription/presentation/dto/holy365-transcription.dto';

@RestApiController('/holy365', 'Holy365 Transcription')
export class Holy365TranscriptionController {
  constructor(private readonly transcriptionUseCase: Holy365TranscriptionUseCase) {}

  @Holy365Auth()
  @RestApiPost(Holy365SubmitVerseResponse, { path: '/transcriptions/verses', description: '절 하나 필사 완료 — 본문과 같아야 기록된다' })
  submitVerse(@Holy365User() signature: Holy365Signature, @Body() request: Holy365SubmitVerseRequest) {
    return this.transcriptionUseCase.submitVerse(signature.id, { ...request, seconds: request.seconds ?? 0 });
  }

  @Holy365Auth()
  @RestApiGet(Holy365ChapterStateResponse, { path: '/transcriptions/chapter', description: '장 필사 상태 (절마다 쓴 횟수)' })
  chapter(@Holy365User() signature: Holy365Signature, @Query() query: Holy365ChapterQuery) {
    return this.transcriptionUseCase.chapterState(signature.id, query.version, query.book, query.chapter);
  }

  @Holy365Auth()
  @RestApiGet(Holy365SummaryResponse, { path: '/progress/summary', description: '내 진행 현황 요약 — 번역본별 완주 횟수 · 진행률 · 연속일' })
  summary(@Holy365User() signature: Holy365Signature) {
    return this.transcriptionUseCase.summary(signature.id);
  }

  @Holy365Auth()
  @RestApiGet(Holy365BooksProgressResponse, { path: '/progress/books', description: '권 · 장별 필사 횟수와 진행' })
  books(@Holy365User() signature: Holy365Signature, @Query() query: Holy365VersionQuery) {
    return this.transcriptionUseCase.books(signature.id, query.version);
  }

  @Holy365Auth()
  @RestApiGet(Holy365DailyResponse, { path: '/progress/daily', description: '최근 n일 일별 필사량' })
  async daily(@Holy365User() signature: Holy365Signature, @Query() query: Holy365DailyQuery) {
    return { days: await this.transcriptionUseCase.daily(signature.id, query.days ?? 182) };
  }
}
