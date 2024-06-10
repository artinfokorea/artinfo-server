import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '@/system/entity/image.entity';
import { ImageCreator } from '@/system/repository/operation/image.creator';

@Injectable()
export class ImageRepository {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async createMany(creators: ImageCreator[]) {
    const createdImages = creators.map(creator => this.imageRepository.create(creator));

    const images = await this.imageRepository.save(createdImages);

    return images.map(image => image.savedPath);
  }
}
