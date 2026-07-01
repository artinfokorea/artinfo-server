import { ApiProperty } from '@nestjs/swagger';
import { OnchurchPastor } from '@/onchurch/about/domain/entity/onchurch-pastor.entity';
import { OnchurchVision } from '@/onchurch/about/domain/entity/onchurch-vision.entity';
import { OnchurchHistory } from '@/onchurch/about/domain/entity/onchurch-history.entity';
import { OnchurchStaff } from '@/onchurch/about/domain/entity/onchurch-staff.entity';
import { PublicAboutView } from '@/onchurch/about/application/usecase/onchurch-list-public-about.usecase';

export class OnchurchPastorResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: String, nullable: true }) role: string | null;
  @ApiProperty({ type: String, nullable: true }) eng: string | null;
  @ApiProperty({ type: String, nullable: true }) message: string | null;
  @ApiProperty({ type: String, nullable: true }) longMessage: string | null;
  @ApiProperty({ type: String, nullable: true }) photoUrl: string | null;

  constructor(p: OnchurchPastor) {
    this.id = p.id;
    this.name = p.name;
    this.role = p.role;
    this.eng = p.eng;
    this.message = p.message;
    this.longMessage = p.longMessage;
    this.photoUrl = p.photoUrl;
  }
}

export class OnchurchVisionResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) ko: string;
  @ApiProperty({ type: String, nullable: true }) en: string | null;
  @ApiProperty({ type: String, nullable: true }) description: string | null;
  @ApiProperty({ type: Number }) sortOrder: number;

  constructor(v: OnchurchVision) {
    this.id = v.id;
    this.ko = v.ko;
    this.en = v.en;
    this.description = v.description;
    this.sortOrder = v.sortOrder;
  }
}

export class OnchurchHistoryResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) year: string;
  @ApiProperty({ type: String }) title: string;
  @ApiProperty({ type: String, nullable: true }) description: string | null;
  @ApiProperty({ type: Number }) sortOrder: number;

  constructor(h: OnchurchHistory) {
    this.id = h.id;
    this.year = h.year;
    this.title = h.title;
    this.description = h.description;
    this.sortOrder = h.sortOrder;
  }
}

export class OnchurchStaffResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: String, nullable: true }) role: string | null;
  @ApiProperty({ type: String, nullable: true }) area: string | null;
  @ApiProperty({ type: String, nullable: true }) photoUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) phone: string | null;
  @ApiProperty({ type: String, nullable: true }) email: string | null;
  @ApiProperty({ type: Number }) sortOrder: number;

  constructor(s: OnchurchStaff) {
    this.id = s.id;
    this.name = s.name;
    this.role = s.role;
    this.area = s.area;
    this.photoUrl = s.photoUrl;
    this.phone = s.phone;
    this.email = s.email;
    this.sortOrder = s.sortOrder;
  }
}

export class OnchurchMyPastorResponse {
  @ApiProperty({ type: OnchurchPastorResponse, nullable: true })
  pastor: OnchurchPastorResponse | null;
  constructor(p: OnchurchPastor | null) {
    this.pastor = p ? new OnchurchPastorResponse(p) : null;
  }
}

export class OnchurchVisionListResponse {
  @ApiProperty({ type: [OnchurchVisionResponse] })
  visions: OnchurchVisionResponse[];
  constructor(items: OnchurchVision[]) {
    this.visions = items.map(v => new OnchurchVisionResponse(v));
  }
}

export class OnchurchHistoryListResponse {
  @ApiProperty({ type: [OnchurchHistoryResponse] })
  histories: OnchurchHistoryResponse[];
  constructor(items: OnchurchHistory[]) {
    this.histories = items.map(h => new OnchurchHistoryResponse(h));
  }
}

export class OnchurchStaffListResponse {
  @ApiProperty({ type: [OnchurchStaffResponse] })
  staffs: OnchurchStaffResponse[];
  constructor(items: OnchurchStaff[]) {
    this.staffs = items.map(s => new OnchurchStaffResponse(s));
  }
}

export class OnchurchPublicAboutResponse {
  @ApiProperty({ type: OnchurchPastorResponse, nullable: true })
  pastor: OnchurchPastorResponse | null;

  @ApiProperty({ type: [OnchurchVisionResponse] })
  visions: OnchurchVisionResponse[];

  @ApiProperty({ type: [OnchurchHistoryResponse] })
  histories: OnchurchHistoryResponse[];

  @ApiProperty({ type: [OnchurchStaffResponse] })
  staffs: OnchurchStaffResponse[];

  constructor(view: PublicAboutView) {
    this.pastor = view.pastor ? new OnchurchPastorResponse(view.pastor) : null;
    this.visions = view.visions.map(v => new OnchurchVisionResponse(v));
    this.histories = view.histories.map(h => new OnchurchHistoryResponse(h));
    this.staffs = view.staffs.map(s => new OnchurchStaffResponse(s));
  }
}
