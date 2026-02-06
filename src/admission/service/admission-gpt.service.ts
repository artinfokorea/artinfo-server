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

function buildPrompt(targetMajors: string[]): string {
  return `당신은 음악대학 입시 요강 PDF에서 정보를 추출하는 전문가입니다.

## 작업 순서 (반드시 이 순서대로 수행)

### 1단계: 실기고사 일정 먼저 찾기
PDF 전체를 훑어서 실기고사/실기시험 일정을 먼저 찾으세요.
- "실기고사", "실기시험", "고사일정", "시험일정", "전형일정", "고사일", "시험일" 등의 키워드를 찾으세요.
- 보통 "전형 일정표", "모집 일정", "고사 일정" 등의 표(테이블)에 있습니다.
- 1차 실기, 2차 실기 등 차수별 날짜를 모두 파악하세요.
- 전공 공통 일정이면 모든 전공에 동일하게 적용합니다.

### 2단계: 전공별 실기 과제 찾기
각 전공별 실기 시험 내용(과제곡, 연주곡, 시험 방법)을 찾으세요.

### 3단계: 원서접수/서류제출/합격발표 일정 찾기
원서접수 기간, 서류제출 기간, 합격자 발표일을 찾으세요.

### 4단계: JSON 조합
위에서 찾은 정보를 전공별로 조합하여 JSON을 생성하세요.

## 추출 대상 전공
${targetMajors.join(', ')}
위 목록에 없는 전공(국악, 실용음악 등)은 무시하세요.
majorKeyword는 반드시 위 목록의 이름과 정확히 일치하도록 설정해주세요.

## JSON 스키마
{
  "admissions": [
    {
      "schoolName": "학교명",
      "admissionType": "GENERAL(정시/일반전형) 또는 SPECIAL(수시/특별전형)",
      "year": 입시년도,
      "majorKeyword": "전공명 — 반드시 위 목록과 동일",
      "applicationStartAt": "원서접수 시작일 (ISO 8601)",
      "applicationEndAt": "원서접수 마감일 (ISO 8601)",
      "applicationNote": "원서접수 비고 또는 null",
      "documentStartAt": "서류제출 시작일 또는 null",
      "documentEndAt": "서류제출 마감일 또는 null",
      "documentNote": "서류제출 비고 또는 null",
      "finalResultAt": "최종 합격자 발표일 또는 null",
      "rounds": [
        {
          "roundNumber": 1,
          "examStartAt": "실기고사 시작일 (ISO 8601)",
          "examEndAt": "실기고사 종료일 (ISO 8601, 1일이면 시작일과 동일)",
          "resultAt": "해당 차수 합격자 발표일 또는 null",
          "registrationStartAt": null,
          "registrationEndAt": null,
          "note": "실기고사 장소/시간 등 부가정보 또는 null",
          "tasks": [
            {
              "description": "실기 과제 상세 (곡목, 조건, 시간제한 등)",
              "sequence": 1,
              "note": null
            }
          ]
        }
      ]
    }
  ]
}

## 핵심 규칙
- rounds 배열은 절대 비워두지 마세요. 모든 전공에 최소 1개의 round가 있어야 합니다.
- examStartAt, examEndAt은 절대 null이면 안 됩니다. PDF 어딘가에 실기고사 일정이 반드시 있습니다.
- 전공별 개별 실기 일정이 없으면, 전체 공통 실기고사 일정을 사용하세요.
- PDF에 존재하는 전공만 추출 (목록에 있더라도 PDF에 없으면 생략)
- 날짜는 ISO 8601 (예: 2025-09-18T00:00:00)
- JSON만 반환하고 다른 텍스트는 포함하지 마세요`;
}

const BATCH_SIZE = 3;

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

    const batches: string[][] = [];
    for (let i = 0; i < knownMajorNames.length; i += BATCH_SIZE) {
      batches.push(knownMajorNames.slice(i, i + BATCH_SIZE));
    }

    console.log(`[AdmissionGpt] 추출 시작 — 대상 전공 ${knownMajorNames.length}개, ${batches.length}배치 (병렬)`);

    const batchPromises = batches.map((batch, i) => {
      console.log(`[AdmissionGpt] 배치 ${i + 1}/${batches.length} 요청 — ${batch.join(', ')}`);
      return this.extractBatch(base64, filename, batch).then(results => {
        console.log(`[AdmissionGpt] 배치 ${i + 1} 완료: ${results.length}개 전공 추출`);
        return results;
      });
    });

    const batchResults = await Promise.all(batchPromises);
    const results = batchResults.flat();

    console.log(`[AdmissionGpt] 전체 추출 완료: ${results.length}개 전공 — ${results.map(a => a.majorKeyword).join(', ')}`);
    return results;
  }

  private async extractBatch(base64: string, filename: string, targetMajors: string[]): Promise<ExtractedAdmissionData[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildPrompt(targetMajors) },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'PDF에서 클래식 전공별 입시 정보를 모두 추출해주세요. 실기고사 날짜와 실기 과제를 반드시 포함해주세요.' },
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
      console.log(`GPT extraction error for [${targetMajors.join(', ')}]:`, e);
      throw new AdmissionGptExtractionFailed(`추출 실패 (${targetMajors.join(', ')}): ${(e as Error).message}`);
    }
  }
}
