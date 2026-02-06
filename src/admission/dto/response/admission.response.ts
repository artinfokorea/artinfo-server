import { ApiProperty } from '@nestjs/swagger';
import { Admission, ADMISSION_TYPE } from '@/admission/entity/admission.entity';
import { AdmissionRound } from '@/admission/entity/admission-round.entity';
import { AdmissionRoundTask } from '@/admission/entity/admission-round-task.entity';

export class AdmissionRoundTaskResponse {
  @ApiProperty({ type: 'number', required: true, description: '과제 아이디' })
  id: number;

  @ApiProperty({ type: 'string', required: true, description: '과제 설명' })
  description: string;

  @ApiProperty({ type: 'number', required: true, description: '순서' })
  sequence: number;

  @ApiProperty({ type: 'string', required: false, description: '비고' })
  note: string | null;

  constructor(task: AdmissionRoundTask) {
    this.id = task.id;
    this.description = task.description;
    this.sequence = task.sequence;
    this.note = task.note;
  }
}

export class AdmissionRoundResponse {
  @ApiProperty({ type: 'number', required: true, description: '라운드 아이디' })
  id: number;

  @ApiProperty({ type: 'number', required: true, description: '차수' })
  roundNumber: number;

  @ApiProperty({ type: 'date', required: true, description: '시험 시작일' })
  examStartAt: Date;

  @ApiProperty({ type: 'date', required: true, description: '시험 종료일' })
  examEndAt: Date;

  @ApiProperty({ type: 'date', required: false, description: '합격자 발표일' })
  resultAt: Date | null;

  @ApiProperty({ type: 'string', required: false, description: '비고' })
  note: string | null;

  @ApiProperty({ type: [AdmissionRoundTaskResponse], required: true, description: '실기 과제 목록' })
  tasks: AdmissionRoundTaskResponse[];

  constructor(round: AdmissionRound) {
    this.id = round.id;
    this.roundNumber = round.roundNumber;
    this.examStartAt = round.examStartAt;
    this.examEndAt = round.examEndAt;
    this.resultAt = round.resultAt;
    this.note = round.note;
    this.tasks = (round.tasks ?? []).map(task => new AdmissionRoundTaskResponse(task));
  }
}

export class AdmissionResponse {
  @ApiProperty({ type: 'number', required: true, description: '입시 아이디' })
  id: number;

  @ApiProperty({ enum: ADMISSION_TYPE, enumName: 'ADMISSION_TYPE', required: true, description: '입시 유형' })
  type: ADMISSION_TYPE;

  @ApiProperty({ type: 'number', required: true, description: '입시 년도' })
  year: number;

  @ApiProperty({ type: 'string', required: true, description: '학교명' })
  schoolName: string;

  @ApiProperty({ type: 'number', required: true, description: '전공 카테고리 아이디' })
  majorCategoryId: number;

  @ApiProperty({ type: 'string', required: true, description: '전공명 (한글)' })
  majorName: string;

  @ApiProperty({ type: 'date', required: true, description: '원서접수 시작일' })
  applicationStartAt: Date;

  @ApiProperty({ type: 'date', required: true, description: '원서접수 마감일' })
  applicationEndAt: Date;

  @ApiProperty({ type: 'date', required: false, description: '최종 합격자 발표일' })
  finalResultAt: Date | null;

  @ApiProperty({ type: [AdmissionRoundResponse], required: true, description: '시험 라운드 목록' })
  rounds: AdmissionRoundResponse[];

  @ApiProperty({ type: 'date', required: true, description: '생성일' })
  createdAt: Date;

  constructor(admission: Admission) {
    this.id = admission.id;
    this.type = admission.type;
    this.year = admission.year;
    this.schoolName = admission.schoolName;
    this.majorCategoryId = admission.majorCategoryId;
    this.majorName = admission.majorCategory?.koName ?? '';
    this.applicationStartAt = admission.applicationStartAt;
    this.applicationEndAt = admission.applicationEndAt;
    this.finalResultAt = admission.finalResultAt;
    this.rounds = (admission.rounds ?? []).map(round => new AdmissionRoundResponse(round));
    this.createdAt = admission.createdAt;
  }
}
