import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AdmissionGptExtractionFailed } from '@/admission/exception/admission.exception';

export interface ExtractedRound {
  roundNumber: number;
  examStartAt: string;
  examEndAt: string;
  resultAt: string | null;
  registrationStartAt: string | null;
  registrationEndAt: string | null;
  note: string | null;
  tasks: {
    description: string;
    sequence: number;
    note: string | null;
  }[];
}

export interface ExtractedAdmissionData {
  schoolName: string;
  admissionType: 'GENERAL' | 'SPECIAL';
  year: number;
  majorKeyword: string;
  applicationStartAt: string;
  applicationEndAt: string;
  applicationNote: string | null;
  documentStartAt: string | null;
  documentEndAt: string | null;
  documentNote: string | null;
  finalResultAt: string | null;
  rounds: ExtractedRound[];
}

export interface ExtractedAdmissionResponse {
  admissions: ExtractedAdmissionData[];
}

const MAJOR_LIST_PROMPT = `당신은 음악대학 입시 요강 PDF를 분석하는 전문가입니다.
이 PDF에서 언급된 모든 음악 세부 전공(악기/분야)을 빠짐없이 추출해주세요.

반드시 아래 JSON 형식으로 반환해주세요:
{
  "majors": ["피아노", "바이올린", "성악", ...]
}

규칙:
- "음악원", "음악학부", "기악과" 같은 상위 카테고리가 아닌, 구체적인 세부 전공명만 추출
- 성악의 경우 성부(소프라노, 메조소프라노, 테너 등)가 구분되어 있으면 각각 분리, 구분이 없으면 "성악"으로 통합
- 같은 전공이 여러 번 나와도 중복 없이 한 번만 포함
- JSON만 반환하고 다른 텍스트는 포함하지 마세요`;

function buildDetailPrompt(targetMajors: string[], knownMajorNames: string[]): string {
  const knownNamesSection =
    knownMajorNames.length > 0
      ? `\nDB에 등록된 전공명 목록: ${knownMajorNames.join(', ')}\nmajorKeyword는 가능하면 위 목록의 이름과 정확히 일치하도록 설정해주세요.\n`
      : '';

  return `당신은 음악대학 입시 요강 PDF에서 정보를 추출하는 전문가입니다.
이 PDF에서 다음 전공들의 입시 정보를 추출해주세요: ${targetMajors.join(', ')}
${knownNamesSection}
반드시 아래 JSON 스키마를 따라주세요:
{
  "admissions": [
    {
      "schoolName": "학교명",
      "admissionType": "GENERAL 또는 SPECIAL",
      "year": 입시년도 (숫자),
      "majorKeyword": "세부 전공명 (예: 피아노, 바이올린, 성악, 작곡, 플루트 등)",
      "applicationStartAt": "원서접수 시작일 (ISO 8601)",
      "applicationEndAt": "원서접수 마감일 (ISO 8601)",
      "applicationNote": "원서접수 관련 비고 또는 null",
      "documentStartAt": "서류제출 시작일 또는 null",
      "documentEndAt": "서류제출 마감일 또는 null",
      "documentNote": "서류제출 관련 비고 또는 null",
      "finalResultAt": "최종 합격자 발표일 또는 null",
      "rounds": [
        {
          "roundNumber": 1,
          "examStartAt": "시험 시작일 (ISO 8601)",
          "examEndAt": "시험 종료일 (ISO 8601)",
          "resultAt": "합격자 발표일 또는 null",
          "registrationStartAt": "해당 차수 접수 시작일 또는 null",
          "registrationEndAt": "해당 차수 접수 마감일 또는 null",
          "note": "비고 또는 null",
          "tasks": [
            {
              "description": "실기 과제 설명",
              "sequence": 1,
              "note": "과제 관련 비고 또는 null"
            }
          ]
        }
      ]
    }
  ]
}

규칙:
- 위에 지정된 전공들의 정보만 추출 (다른 전공은 무시)
- 전공별로 별도의 객체로 분리 (같은 일정이라도 실기 과제가 다르면 별도 객체)
- majorKeyword는 반드시 구체적인 악기/전공명
- 날짜는 반드시 ISO 8601 형식 (예: 2025-09-18T00:00:00)
- 시간 정보가 있으면 포함, 없으면 T00:00:00
- 실기 차수(rounds)는 1차, 2차 순서대로
- 각 차수의 과제(tasks)는 순서대로 sequence 부여 (1부터)
- 정보가 없는 필드는 null
- JSON만 반환하고 다른 텍스트는 포함하지 마세요`;
}

const BATCH_SIZE = 8;

@Injectable()
export class AdmissionGptService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY'],
      maxRetries: 10,
    });
  }

  async extractFromPdf(buffer: Buffer, filename: string, knownMajorNames: string[] = []): Promise<ExtractedAdmissionData[]> {
    const base64 = buffer.toString('base64');

    // Phase 1: 전공 목록 추출
    console.log('[AdmissionGpt] Phase 1: 전공 목록 추출 시작');
    const majorList = await this.extractMajorList(base64, filename);
    console.log(`[AdmissionGpt] Phase 1 완료: ${majorList.length}개 전공 — ${majorList.join(', ')}`);

    if (majorList.length === 0) {
      throw new AdmissionGptExtractionFailed('PDF에서 음악 전공을 찾지 못했습니다.');
    }

    // Phase 2: 배치별 상세 추출
    const batches: string[][] = [];
    for (let i = 0; i < majorList.length; i += BATCH_SIZE) {
      batches.push(majorList.slice(i, i + BATCH_SIZE));
    }

    const results: ExtractedAdmissionData[] = [];
    for (let i = 0; i < batches.length; i++) {
      if (i > 0) {
        console.log(`[AdmissionGpt] Rate limit 대기 60초...`);
        await this.sleep(60_000);
      }
      const batch = batches[i];
      console.log(`[AdmissionGpt] Phase 2: 배치 ${i + 1}/${batches.length} — ${batch.join(', ')}`);
      const batchResults = await this.extractDetailsForMajors(base64, filename, batch, knownMajorNames);
      results.push(...batchResults);
      console.log(`[AdmissionGpt] 배치 ${i + 1} 완료: ${batchResults.length}개 전공 추출`);
    }

    console.log(`[AdmissionGpt] 전체 추출 완료: ${results.length}개 전공`);
    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async extractMajorList(base64: string, filename: string): Promise<string[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: MAJOR_LIST_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: '이 입시 요강 PDF에서 언급된 모든 음악 세부 전공을 빠짐없이 추출해주세요.' },
              {
                type: 'file',
                file: {
                  file_data: `data:application/pdf;base64,${base64}`,
                  filename,
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AdmissionGptExtractionFailed('GPT 전공 목록 응답이 비어있습니다.');
      }

      const parsed = JSON.parse(content) as { majors: string[] };
      if (!parsed.majors || !Array.isArray(parsed.majors)) {
        throw new AdmissionGptExtractionFailed('전공 목록 형식이 올바르지 않습니다.');
      }

      return parsed.majors;
    } catch (e) {
      if (e instanceof AdmissionGptExtractionFailed) throw e;
      console.log('GPT major list extraction error:', e);
      throw new AdmissionGptExtractionFailed(`전공 목록 추출 실패: ${(e as Error).message}`);
    }
  }

  private async extractDetailsForMajors(
    base64: string,
    filename: string,
    targetMajors: string[],
    knownMajorNames: string[],
  ): Promise<ExtractedAdmissionData[]> {
    const prompt = buildDetailPrompt(targetMajors, knownMajorNames);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: `다음 전공들의 입시 정보를 추출해주세요: ${targetMajors.join(', ')}` },
              {
                type: 'file',
                file: {
                  file_data: `data:application/pdf;base64,${base64}`,
                  filename,
                },
              },
            ],
          },
        ],
        max_tokens: 16384,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.log(`[AdmissionGpt] 빈 응답: ${targetMajors.join(', ')}`);
        return [];
      }

      const parsed = JSON.parse(content) as ExtractedAdmissionResponse;
      return parsed.admissions || [];
    } catch (e) {
      if (e instanceof AdmissionGptExtractionFailed) throw e;
      console.log(`GPT detail extraction error for [${targetMajors.join(', ')}]:`, e);
      throw new AdmissionGptExtractionFailed(`상세 추출 실패 (${targetMajors.join(', ')}): ${(e as Error).message}`);
    }
  }
}
