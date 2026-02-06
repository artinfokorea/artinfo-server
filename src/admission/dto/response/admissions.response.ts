import { ApiProperty } from '@nestjs/swagger';
import { Admission } from '@/admission/entity/admission.entity';
import { AdmissionResponse } from '@/admission/dto/response/admission.response';

export class AdmissionsResponse {
  @ApiProperty({ type: [AdmissionResponse], required: true, description: '입시 목록' })
  admissions: AdmissionResponse[];

  @ApiProperty({ type: 'number', required: true, description: '총 개수', example: 5 })
  totalCount: number;

  constructor({ admissions, totalCount }: { admissions: Admission[]; totalCount: number }) {
    this.admissions = admissions.map(admission => new AdmissionResponse(admission));
    this.totalCount = totalCount;
  }
}
