import { OnchurchSaintGender } from '@/onchurch/saint/domain/entity/onchurch-saint.entity';

export class OnchurchSaintWriteCommand {
  name: string;
  photoUrl: string | null;
  birthDate: string | null;
  gender: OnchurchSaintGender | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  position: string | null;
  ordinationDate: string | null;
  faithLevel: string | null;

  constructor(p: {
    name: string;
    photoUrl: string | null;
    birthDate: string | null;
    gender: OnchurchSaintGender | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    position: string | null;
    ordinationDate: string | null;
    faithLevel: string | null;
  }) {
    this.name = p.name;
    this.photoUrl = p.photoUrl;
    this.birthDate = p.birthDate;
    this.gender = p.gender;
    this.phone = p.phone;
    this.email = p.email;
    this.address = p.address;
    this.position = p.position;
    this.ordinationDate = p.ordinationDate;
    this.faithLevel = p.faithLevel;
  }
}

export class OnchurchSaintRelationCreateCommand {
  relatedSaintId: number;
  relation: string;

  constructor(p: { relatedSaintId: number; relation: string }) {
    this.relatedSaintId = p.relatedSaintId;
    this.relation = p.relation;
  }
}
