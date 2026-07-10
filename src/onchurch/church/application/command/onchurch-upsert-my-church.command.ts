export class OnchurchUpsertMyChurchCommand {
  slug: string;
  name: string;
  eng: string | null;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  representative: string | null;
  businessNo: string | null;
  logoUrl: string | null;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  liveUrl: string | null;
  isLive: boolean;
  enabledPages: string[];
  homeSectionOrder: string[];
  homeQuickLinks: string[];
  siteLang: string;

  constructor(params: {
    slug: string;
    name: string;
    eng: string | null;
    tagline: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    representative: string | null;
    businessNo: string | null;
    logoUrl: string | null;
    youtubeUrl: string | null;
    instagramUrl: string | null;
    liveUrl: string | null;
    isLive: boolean;
    enabledPages: string[];
    homeSectionOrder: string[];
    homeQuickLinks: string[];
    siteLang: string;
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
    this.youtubeUrl = params.youtubeUrl;
    this.instagramUrl = params.instagramUrl;
    this.liveUrl = params.liveUrl;
    this.isLive = params.isLive;
    this.enabledPages = params.enabledPages;
    this.homeSectionOrder = params.homeSectionOrder;
    this.homeQuickLinks = params.homeQuickLinks;
    this.siteLang = params.siteLang;
  }
}
