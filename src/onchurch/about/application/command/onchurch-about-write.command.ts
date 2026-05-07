export class OnchurchPastorWriteCommand {
  name: string;
  role: string | null;
  eng: string | null;
  message: string | null;
  longMessage: string | null;
  photoUrl: string | null;

  constructor(p: { name: string; role: string | null; eng: string | null; message: string | null; longMessage: string | null; photoUrl: string | null }) {
    this.name = p.name;
    this.role = p.role;
    this.eng = p.eng;
    this.message = p.message;
    this.longMessage = p.longMessage;
    this.photoUrl = p.photoUrl;
  }
}

export class OnchurchVisionWriteCommand {
  ko: string;
  en: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;

  constructor(p: { ko: string; en: string | null; description: string | null; sortOrder: number; isActive: boolean }) {
    this.ko = p.ko;
    this.en = p.en;
    this.description = p.description;
    this.sortOrder = p.sortOrder;
    this.isActive = p.isActive;
  }
}

export class OnchurchHistoryWriteCommand {
  year: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;

  constructor(p: { year: string; title: string; description: string | null; sortOrder: number; isActive: boolean }) {
    this.year = p.year;
    this.title = p.title;
    this.description = p.description;
    this.sortOrder = p.sortOrder;
    this.isActive = p.isActive;
  }
}

export class OnchurchStaffWriteCommand {
  name: string;
  role: string | null;
  area: string | null;
  photoUrl: string | null;
  sortOrder: number;
  isActive: boolean;

  constructor(p: { name: string; role: string | null; area: string | null; photoUrl: string | null; sortOrder: number; isActive: boolean }) {
    this.name = p.name;
    this.role = p.role;
    this.area = p.area;
    this.photoUrl = p.photoUrl;
    this.sortOrder = p.sortOrder;
    this.isActive = p.isActive;
  }
}
