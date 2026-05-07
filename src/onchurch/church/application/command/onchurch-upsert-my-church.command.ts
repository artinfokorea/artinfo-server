export class OnchurchUpsertMyChurchCommand {
  slug: string;
  name: string;
  eng: string | null;
  tagline: string | null;
  phone: string;
  email: string;
  address: string;
  representative: string | null;
  businessNo: string | null;
  logoUrl: string | null;
  enabledPages: string[];

  constructor(params: {
    slug: string;
    name: string;
    eng: string | null;
    tagline: string | null;
    phone: string;
    email: string;
    address: string;
    representative: string | null;
    businessNo: string | null;
    logoUrl: string | null;
    enabledPages: string[];
  }) {
    this.slug = params.slug;
    this.name = params.name;
    this.eng = params.eng;
    this.tagline = params.tagline;
    this.phone = params.phone;
    this.email = params.email;
    this.address = params.address;
    this.representative = params.representative;
    this.businessNo = params.businessNo;
    this.logoUrl = params.logoUrl;
    this.enabledPages = params.enabledPages;
  }
}
