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

  constructor(p: { ko: string; en: string | null; description: string | null; sortOrder: number }) {
    this.ko = p.ko;
    this.en = p.en;
    this.description = p.description;
    this.sortOrder = p.sortOrder;
  }
}

export class OnchurchHistoryWriteCommand {
  year: string;
  title: string;
  description: string | null;
  sortOrder: number;

  constructor(p: { year: string; title: string; description: string | null; sortOrder: number }) {
    this.year = p.year;
    this.title = p.title;
    this.description = p.description;
    this.sortOrder = p.sortOrder;
  }
}

export class OnchurchStaffWriteCommand {
  name: string;
  role: string | null;
  area: string | null;
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  sortOrder: number;

  constructor(p: { name: string; role: string | null; area: string | null; photoUrl: string | null; phone: string | null; email: string | null; sortOrder: number }) {
    this.name = p.name;
    this.role = p.role;
    this.area = p.area;
    this.photoUrl = p.photoUrl;
    this.phone = p.phone;
    this.email = p.email;
    this.sortOrder = p.sortOrder;
  }
}
