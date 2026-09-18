import { OnchurchCustomPageBlock } from '@/onchurch/custom-page/domain/entity/onchurch-custom-page.entity';

export class OnchurchCustomPageWriteCommand {
  slug: string;
  title: string;
  summary: string | null;
  blocks: OnchurchCustomPageBlock[];
  isActive: boolean;

  constructor(params: { slug: string; title: string; summary: string | null; blocks: OnchurchCustomPageBlock[]; isActive: boolean }) {
    this.slug = params.slug;
    this.title = params.title;
    this.summary = params.summary;
    this.blocks = params.blocks;
    this.isActive = params.isActive;
  }
}
