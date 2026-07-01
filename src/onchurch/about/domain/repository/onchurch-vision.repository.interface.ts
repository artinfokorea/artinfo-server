import { OnchurchVision } from '@/onchurch/about/domain/entity/onchurch-vision.entity';

export const ONCHURCH_VISION_REPOSITORY = Symbol('ONCHURCH_VISION_REPOSITORY');

export interface OnchurchVisionWriteParams {
  ko: string;
  en: string | null;
  description: string | null;
  sortOrder: number;
}

export interface IOnchurchVisionRepository {
  findAllByChurchId(churchId: number): Promise<OnchurchVision[]>;
  findOwnedById(churchId: number, id: number): Promise<OnchurchVision | null>;
  create(churchId: number, params: OnchurchVisionWriteParams): Promise<OnchurchVision>;
  update(churchId: number, id: number, params: OnchurchVisionWriteParams): Promise<OnchurchVision>;
  remove(churchId: number, id: number): Promise<void>;
}
