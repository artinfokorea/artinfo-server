import { ONCHURCH_CUSTOM_PAGE_VISIBILITY, OnchurchCustomPageBlock } from '@/onchurch/custom-page/domain/entity/onchurch-custom-page.entity';

export class OnchurchCustomPageWriteCommand {
  slug: string;
  title: string;
  summary: string | null;
  blocks: OnchurchCustomPageBlock[];
  isActive: boolean;
  visibility: ONCHURCH_CUSTOM_PAGE_VISIBILITY;

  constructor(params: {
    slug: string;
    title: string;
    summary: string | null;
    blocks: OnchurchCustomPageBlock[];
    isActive: boolean;
    visibility: ONCHURCH_CUSTOM_PAGE_VISIBILITY;
  }) {
    this.slug = params.slug;
    this.title = params.title;
    this.summary = params.summary;
    this.blocks = params.blocks;
    this.isActive = params.isActive;
    this.visibility = params.visibility;
  }
}
