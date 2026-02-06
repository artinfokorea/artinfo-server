import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ART_CATEGORY, MajorCategory } from '@/job/entity/major-category.entity';
import { AdmissionGptService, ExtractedAdmissionData } from '@/admission/service/admission-gpt.service';
import { AdmissionRepository } from '@/admission/repository/admission.repository';
import { Admission, ADMISSION_TYPE } from '@/admission/entity/admission.entity';
import { AdmissionCreator, AdmissionRoundCreator, AdmissionRoundTaskCreator } from '@/admission/repository/operation/admission.creator';
import { AdmissionGptExtractionFailed } from '@/admission/exception/admission.exception';
import { AdmissionFetcher } from '@/admission/repository/operation/admission.fetcher';
import { PagingItems } from '@/common/type/type';

@Injectable()
export class AdmissionService {
  constructor(
    private readonly admissionGptService: AdmissionGptService,
    private readonly admissionRepository: AdmissionRepository,

    @InjectRepository(MajorCategory)
    private readonly majorCategoryRepository: Repository<MajorCategory>,
  ) {}

  async getAdmissions(fetcher: AdmissionFetcher): Promise<PagingItems<Admission>> {
    return this.admissionRepository.findAdmissions(fetcher);
  }

  async extractAndCreateFromPdf(buffer: Buffer, filename: string): Promise<number> {
    // 1. DB에서 음악 전공 목록 로드
    const musicMajors = await this.majorCategoryRepository.find({
      where: { firstGroupEn: ART_CATEGORY.MUSIC },
    });
    const knownMajorNames = [...new Set(musicMajors.map(m => m.koName))];
    console.log(`[Admission] DB 음악 전공 ${musicMajors.length}개 로드`);

    // 2. GPT 2단계 추출 (Phase 1: 전공 목록 → Phase 2: 배치별 상세)
    const extractedList = await this.admissionGptService.extractFromPdf(buffer, filename, knownMajorNames);

    // 3. 매칭 및 저장
    const savedIds: number[] = [];
    const skipped: string[] = [];

    for (const extracted of extractedList) {
      const majorCategory = this.findMatchingMajor(extracted.majorKeyword, musicMajors);

      if (!majorCategory) {
        console.log(`[Admission] 전공 매칭 실패 (스킵): "${extracted.majorKeyword}"`);
        skipped.push(extracted.majorKeyword);
        continue;
      }

      const creator = this.buildCreator(majorCategory.id, extracted);
      const id = await this.admissionRepository.createWithRoundsAndTasks(creator);
      console.log(`[Admission] 저장 완료: "${extracted.majorKeyword}" → ${majorCategory.koName} (majorCategoryId: ${majorCategory.id}, admissionId: ${id})`);
      savedIds.push(id);
    }

    if (skipped.length) {
      console.log(`[Admission] 매칭 실패 전공 목록: ${skipped.join(', ')}`);
    }

    console.log(`[Admission] 총 ${extractedList.length}개 전공 중 ${savedIds.length}개 저장, ${skipped.length}개 스킵`);

    if (savedIds.length === 0) {
      throw new AdmissionGptExtractionFailed(`매칭되는 전공이 없습니다. GPT 추출 전공: ${extractedList.map(e => e.majorKeyword).join(', ')}`);
    }

    return savedIds[0];
  }

  private findMatchingMajor(keyword: string, musicMajors: MajorCategory[]): MajorCategory | null {
    const normalized = keyword.replace(/\s*(전공|과|학과|학부)\s*$/g, '').trim();

    // 1. 정확히 일치
    const exact = musicMajors.find(m => m.koName === normalized);
    if (exact) return exact;

    // 2. 포함 관계 (DB이름이 키워드에 포함되거나, 키워드가 DB이름에 포함)
    const contains = musicMajors.find(m => m.koName.includes(normalized) || normalized.includes(m.koName));
    if (contains) return contains;

    return null;
  }

  private buildCreator(majorCategoryId: number, data: ExtractedAdmissionData): AdmissionCreator {
    return new AdmissionCreator({
      majorCategoryId,
      type: data.admissionType === 'SPECIAL' ? ADMISSION_TYPE.SPECIAL : ADMISSION_TYPE.GENERAL,
      year: data.year,
      schoolName: data.schoolName,
      applicationStartAt: new Date(data.applicationStartAt),
      applicationEndAt: new Date(data.applicationEndAt),
      applicationNote: data.applicationNote,
      documentStartAt: data.documentStartAt ? new Date(data.documentStartAt) : null,
      documentEndAt: data.documentEndAt ? new Date(data.documentEndAt) : null,
      documentNote: data.documentNote,
      finalResultAt: data.finalResultAt ? new Date(data.finalResultAt) : null,
      rounds: data.rounds.map(
        round =>
          new AdmissionRoundCreator({
            roundNumber: round.roundNumber,
            examStartAt: new Date(round.examStartAt),
            examEndAt: new Date(round.examEndAt),
            resultAt: round.resultAt ? new Date(round.resultAt) : null,
            registrationStartAt: round.registrationStartAt ? new Date(round.registrationStartAt) : null,
            registrationEndAt: round.registrationEndAt ? new Date(round.registrationEndAt) : null,
            note: round.note,
            tasks: round.tasks.map(
              task =>
                new AdmissionRoundTaskCreator({
                  description: task.description,
                  sequence: task.sequence,
                  note: task.note,
                }),
            ),
          }),
      ),
    });
  }
}
