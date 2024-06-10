import { Injectable } from '@nestjs/common';
import { MajorCategoryRepository } from '@/job/repository/major-category.repository';

@Injectable()
export class CommonService {
  constructor(private readonly majorCategoryRepository: MajorCategoryRepository) {}

  getMajors() {
    return this.majorCategoryRepository.findAll();
  }
}
