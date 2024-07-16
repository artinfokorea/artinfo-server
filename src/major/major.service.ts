import { Injectable } from '@nestjs/common';
import { MajorRepository } from '@/major/repository/major.repository';

@Injectable()
export class MajorService {
  constructor(private readonly majorCategoryRepository: MajorRepository) {}

  getAllMajors() {
    return this.majorCategoryRepository.findAll();
  }

  getMajorArt() {
    return this.majorCategoryRepository.findMajorArt();
  }

  getMajorFields() {
    return this.majorCategoryRepository.findMajorFields();
  }
}
