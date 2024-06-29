import { Injectable } from '@nestjs/common';
import { MajorRepository } from '@/major/repository/major.repository';
import { ART_CATEGORY } from '@/job/entity/major-category.entity';

@Injectable()
export class MajorService {
  constructor(private readonly majorCategoryRepository: MajorRepository) {}

  getAllMajors() {
    return this.majorCategoryRepository.findAll();
  }

  getMajorGroups(firstCategory: ART_CATEGORY | null) {
    return this.majorCategoryRepository.findByFirstCategory(firstCategory);
  }
}
