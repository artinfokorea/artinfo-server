import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Province } from '@/lesson/entity/province.entity';
import { IsNull, Repository } from 'typeorm';
import { provinces } from '@/system/entity/provinces';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class ProvinceRepository {
  constructor(
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
  ) {}

  findByParentId(parentId: number | null) {
    const filter: FindOptionsWhere<Province> = {};
    if (parentId) {
      filter.parentId = parentId;
    } else {
      filter.parentId = IsNull();
    }

    return this.provinceRepository.find({ where: filter, order: { name: 'ASC' } });
  }

  async createMany(): Promise<void> {
    const firstDepthProvinces = Object.keys(provinces).map(province => {
      return this.provinceRepository.create({
        depth: 1,
        name: province,
      });
    });

    await this.provinceRepository.save(firstDepthProvinces);

    const secondDepthProvinces: Province[] = [];
    for (const firthProvince of Object.keys(provinces)) {
      for (const secondProvinceName of provinces[firthProvince]) {
        const fetchProvince = await this.provinceRepository.findOneBy({ name: firthProvince });

        const secondProvince = this.provinceRepository.create({
          depth: 2,
          name: secondProvinceName,
          parentId: fetchProvince?.id,
        });
        secondDepthProvinces.push(secondProvince);
      }
    }
    await this.provinceRepository.save(secondDepthProvinces);
  }
}
