import { Injectable } from '@nestjs/common';
import { ProvinceRepository } from '@/province/province.repository';
import { Province } from '@/lesson/entity/province.entity';

@Injectable()
export class ProvinceService {
  constructor(private readonly provinceRepository: ProvinceRepository) {}

  async getProvinces(parentId: number | null): Promise<Province[]> {
    return this.provinceRepository.findByParentId(parentId);
  }

  async insertProvinces(): Promise<void> {
    await this.provinceRepository.createMany();
  }
}
