import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advertisement, ADVERTISEMENT_TYPE } from '@/system/entity/advertisement.entity';

@Injectable()
export class AdvertisementRepository {
  constructor(
    @InjectRepository(Advertisement)
    private advertisementRepository: Repository<Advertisement>,
  ) {}

  async findByType(type: ADVERTISEMENT_TYPE) {
    return this.advertisementRepository.findBy({ type });
  }
}
