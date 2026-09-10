import { ISalpyeoInquiryRepository } from '@/salpyeo/inquiry/domain/repository/salpyeo-inquiry.repository.interface';
import { SalpyeoInquiry, SalpyeoInquiryCreator } from '@/salpyeo/inquiry/domain/entity/salpyeo-inquiry.entity';
import { SalpyeoInquiryNotFound } from '@/salpyeo/inquiry/domain/exception/salpyeo-inquiry.exception';

/** Postgres 없이 확인할 때 쓰는 인메모리 저장소 (SALPYEO_REPOSITORY=memory) */
export class SalpyeoInquiryMemoryRepository implements ISalpyeoInquiryRepository {
  private readonly items: SalpyeoInquiry[] = [];
  private sequence = 0;

  async create(creator: SalpyeoInquiryCreator): Promise<SalpyeoInquiry> {
    const now = new Date();
    const inquiry = {
      id: ++this.sequence,
      title: creator.title,
      content: creator.content,
      email: creator.email,
      images: creator.images,
      isResolved: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    } as SalpyeoInquiry;
    this.items.push(inquiry);

    return inquiry;
  }

  async scan(limit: number): Promise<SalpyeoInquiry[]> {
    return [...this.items].sort((a, b) => b.id - a.id).slice(0, limit);
  }

  async setResolved(id: number, isResolved: boolean): Promise<SalpyeoInquiry> {
    const inquiry = this.items.find(i => i.id === id);
    if (!inquiry) throw new SalpyeoInquiryNotFound();

    inquiry.isResolved = isResolved;
    inquiry.updatedAt = new Date();

    return inquiry;
  }
}
