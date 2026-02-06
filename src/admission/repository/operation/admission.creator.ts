import { ADMISSION_TYPE } from '@/admission/entity/admission.entity';

export class AdmissionRoundTaskCreator {
  description: string;
  sequence: number;
  note: string | null;

  constructor(params: { description: string; sequence: number; note: string | null }) {
    this.description = params.description;
    this.sequence = params.sequence;
    this.note = params.note;
  }
}

export class AdmissionRoundCreator {
  roundNumber: number;
  examStartAt: Date;
  examEndAt: Date;
  resultAt: Date | null;
  registrationStartAt: Date | null;
  registrationEndAt: Date | null;
  note: string | null;
  tasks: AdmissionRoundTaskCreator[];

  constructor(params: {
    roundNumber: number;
    examStartAt: Date;
    examEndAt: Date;
    resultAt: Date | null;
    registrationStartAt: Date | null;
    registrationEndAt: Date | null;
    note: string | null;
    tasks: AdmissionRoundTaskCreator[];
  }) {
    this.roundNumber = params.roundNumber;
    this.examStartAt = params.examStartAt;
    this.examEndAt = params.examEndAt;
    this.resultAt = params.resultAt;
    this.registrationStartAt = params.registrationStartAt;
    this.registrationEndAt = params.registrationEndAt;
    this.note = params.note;
    this.tasks = params.tasks;
  }
}

export class AdmissionCreator {
  majorCategoryId: number;
  type: ADMISSION_TYPE;
  year: number;
  schoolName: string;
  applicationStartAt: Date;
  applicationEndAt: Date;
  applicationNote: string | null;
  documentStartAt: Date | null;
  documentEndAt: Date | null;
  documentNote: string | null;
  finalResultAt: Date | null;
  rounds: AdmissionRoundCreator[];

  constructor(params: {
    majorCategoryId: number;
    type: ADMISSION_TYPE;
    year: number;
    schoolName: string;
    applicationStartAt: Date;
    applicationEndAt: Date;
    applicationNote: string | null;
    documentStartAt: Date | null;
    documentEndAt: Date | null;
    documentNote: string | null;
    finalResultAt: Date | null;
    rounds: AdmissionRoundCreator[];
  }) {
    this.majorCategoryId = params.majorCategoryId;
    this.type = params.type;
    this.year = params.year;
    this.schoolName = params.schoolName;
    this.applicationStartAt = params.applicationStartAt;
    this.applicationEndAt = params.applicationEndAt;
    this.applicationNote = params.applicationNote;
    this.documentStartAt = params.documentStartAt;
    this.documentEndAt = params.documentEndAt;
    this.documentNote = params.documentNote;
    this.finalResultAt = params.finalResultAt;
    this.rounds = params.rounds;
  }
}
