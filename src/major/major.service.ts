import { Injectable } from '@nestjs/common';
import { MajorRepository } from '@/major/repository/major.repository';
import { ART_CATEGORY } from '@/job/entity/major-category.entity';

@Injectable()
export class MajorService {
  constructor(private readonly majorCategoryRepository: MajorRepository) {}

  getAllMajors() {
    return this.majorCategoryRepository.findAll();
  }

  getMajorArt() {
    return this.majorCategoryRepository.findMajorArt();
  }

  getMajorFields(artCategories: ART_CATEGORY[]) {
    return this.majorCategoryRepository.findMajorFieldByArtCategory(artCategories);
  }
}
