import { Injectable } from '@nestjs/common';
import { AdvertisementRepository } from '@/system/repository/advertisement.repository';
import { ADVERTISEMENT_TYPE } from '@/system/entity/advertisement.entity';

@Injectable()
export class AdvertisementService {
  constructor(private readonly advertisementRepository: AdvertisementRepository) {}

  async getAdvertisementsByType(type: ADVERTISEMENT_TYPE) {
    return this.advertisementRepository.findByType(type);
  }
}
