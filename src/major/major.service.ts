import { Injectable } from '@nestjs/common';
import { MajorCategoryRepository } from '@/job/repository/major-category.repository';

@Injectable()
export class MajorService {
  constructor(private readonly majorCategoryRepository: MajorCategoryRepository) {}

  getMajors() {
    return this.majorCategoryRepository.findAll();
  }
}
``;
