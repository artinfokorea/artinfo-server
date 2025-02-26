import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ImageEntity } from '@/system/entity/image.entity';
import { ImageCreator } from '@/system/repository/operation/image.creator';

@Injectable()
export class ImageRepository {
  constructor(
    @InjectRepository(ImageEntity)
    private imageRepository: Repository<ImageEntity>,
  ) {}

  async createMany(creators: ImageCreator[]) {
    const createdImages = creators.map(creator => this.imageRepository.create(creator));

    const images = await this.imageRepository.save(createdImages);

    return images.map(image => image.id);
  }

  async findManyByIds(ids: number[]) {
    return this.imageRepository.findBy({ id: In(ids) });
  }
}
