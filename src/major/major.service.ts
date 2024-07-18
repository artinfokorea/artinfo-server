import { Injectable } from '@nestjs/common';
import { MajorRepository } from '@/major/repository/major.repository';
import { PROFESSIONAL_FIELD_CATEGORY } from '@/job/entity/major-category.entity';

@Injectable()
export class MajorService {
  constructor(private readonly majorCategoryRepository: MajorRepository) {}

  getAllMajors() {
    return this.majorCategoryRepository.findAll();
  }

  getMajorFields(excludeFields: PROFESSIONAL_FIELD_CATEGORY[]) {
    return this.majorCategoryRepository.findMajorFields(excludeFields);
  }
}
