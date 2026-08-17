import { Injectable } from '@nestjs/common';
import { ONGI_LEGAL_DOCS, OngiLegalDoc } from '@/ongi/legal/domain/constant/ongi-legal.constant';
import { OngiLegalDocNotFound } from '@/ongi/legal/domain/exception/ongi-legal.exception';

@Injectable()
export class OngiGetLegalDocUseCase {
  execute(slug: string): OngiLegalDoc {
    const doc = ONGI_LEGAL_DOCS.find(item => item.slug === slug);
    if (!doc) throw new OngiLegalDocNotFound();

    return doc;
  }
}
