import { ApiProperty } from '@nestjs/swagger';
import { OnchurchSaint, OnchurchSaintGender } from '@/onchurch/saint/domain/entity/onchurch-saint.entity';
import { OnchurchSaintRelationView } from '@/onchurch/saint/application/usecase/onchurch-saint-relation.usecase';

export class OnchurchSaintResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ type: String, nullable: true }) photoUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) birthDate: string | null;
  @ApiProperty({ enum: ['male', 'female'], nullable: true }) gender: OnchurchSaintGender | null;
  @ApiProperty({ type: String, nullable: true }) phone: string | null;
  @ApiProperty({ type: String, nullable: true }) email: string | null;
  @ApiProperty({ type: String, nullable: true }) address: string | null;
  @ApiProperty({ type: String, nullable: true }) position: string | null;
  @ApiProperty({ type: String, nullable: true }) ordinationDate: string | null;
  @ApiProperty({ type: String, nullable: true }) faithLevel: string | null;

  constructor(s: OnchurchSaint) {
    this.id = s.id;
    this.name = s.name;
    this.photoUrl = s.photoUrl;
    this.birthDate = s.birthDate;
    this.gender = s.gender;
    this.phone = s.phone;
    this.email = s.email;
    this.address = s.address;
    this.position = s.position;
    this.ordinationDate = s.ordinationDate;
    this.faithLevel = s.faithLevel;
  }
}

export class OnchurchSaintListResponse {
  @ApiProperty({ type: [OnchurchSaintResponse] })
  saints: OnchurchSaintResponse[];
  constructor(items: OnchurchSaint[]) {
    this.saints = items.map((s) => new OnchurchSaintResponse(s));
  }
}

export class OnchurchSaintRelationResponse {
  @ApiProperty({ type: Number }) id: number;
  @ApiProperty({ type: String }) relation: string;
  @ApiProperty({ type: Number }) relatedSaintId: number;
  @ApiProperty({ type: String }) relatedSaintName: string;
  @ApiProperty({ type: String, nullable: true }) relatedSaintPhotoUrl: string | null;

  constructor(v: OnchurchSaintRelationView) {
    this.id = v.id;
    this.relation = v.relation;
    this.relatedSaintId = v.relatedSaintId;
    this.relatedSaintName = v.relatedSaintName;
    this.relatedSaintPhotoUrl = v.relatedSaintPhotoUrl;
  }
}

export class OnchurchSaintRelationListResponse {
  @ApiProperty({ type: [OnchurchSaintRelationResponse] })
  relations: OnchurchSaintRelationResponse[];
  constructor(items: OnchurchSaintRelationView[]) {
    this.relations = items.map((v) => new OnchurchSaintRelationResponse(v));
  }
}
