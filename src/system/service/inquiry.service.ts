import { Injectable } from '@nestjs/common';
import { InquiryRepository } from '@/system/repository/inquiry.repository';
import { CreateInquiryCommand } from '@/system/dto/command/create-inquiry.command';
import { InquiryCreator } from '@/system/repository/operation/inquiry.creator';

@Injectable()
export class InquiryService {
  constructor(private readonly inquiryRepository: InquiryRepository) {}

  async createInquiry(command: CreateInquiryCommand): Promise<number> {
    const creator = new InquiryCreator({
      title: command.title,
      contents: command.contents,
      email: command.email,
    });

    return this.inquiryRepository.create(creator);
  }
}
