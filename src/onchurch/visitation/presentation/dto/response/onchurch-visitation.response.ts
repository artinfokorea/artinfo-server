import { ApiProperty } from '@nestjs/swagger';
import { OnchurchVisitation } from '@/onchurch/visitation/domain/entity/onchurch-visitation.entity';
import { OnchurchVisitationType } from '@/onchurch/visitation/domain/entity/onchurch-visitation-type.entity';

export class OnchurchVisitationResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: Number, nullable: true }) saintId: number | null;
  @ApiProperty({ type: String }) saintName: string;
  @ApiProperty({ type: String, nullable: true }) participants: string | null;
  @ApiProperty({ type: String }) minister: string;
  @ApiProperty({ type: String }) type: string;
  @ApiProperty({ type: String }) date: string;
  @ApiProperty({ type: String, nullable: true }) content: string | null;

  constructor(v: OnchurchVisitation) {
    this.id = v.id;
    this.saintId = v.saintId;
    this.saintName = v.saintName;
    this.participants = v.participants;
    this.minister = v.minister;
    this.type = v.type;
    this.date = v.date;
    this.content = v.content;
  }
}

export class OnchurchVisitationListResponse {
  @ApiProperty({ type: [OnchurchVisitationResponse] })
  visitations: OnchurchVisitationResponse[];
  constructor(items: OnchurchVisitation[]) {
    this.visitations = items.map((v) => new OnchurchVisitationResponse(v));
  }
}

export class OnchurchVisitationTypeResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) name: string;

  constructor(t: OnchurchVisitationType) {
    this.id = t.id;
    this.name = t.name;
  }
}

export class OnchurchVisitationTypeListResponse {
  @ApiProperty({ type: [OnchurchVisitationTypeResponse] })
  types: OnchurchVisitationTypeResponse[];
  constructor(items: OnchurchVisitationType[]) {
    this.types = items.map((t) => new OnchurchVisitationTypeResponse(t));
  }
}
