import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessonArea } from '@/lesson/entity/lesson-area.entity';
import { Repository } from 'typeorm';
import { LessonAreaCreator } from '@/lesson/repository/operation/lesson-area.creator';

@Injectable()
export class LessonAreaRepository {
  constructor(
    @InjectRepository(LessonArea)
    private readonly lessonAreaRepository: Repository<LessonArea>,
  ) {}

  async remove(lessonId: number) {
    await this.lessonAreaRepository.delete({ lesson: { id: lessonId } });
  }

  async createMany(creator: LessonAreaCreator) {
    const areas = creator.names.map(name => {
      return this.lessonAreaRepository.create({
        lesson: { id: creator.lessonId },
        name: name,
      });
    });

    await this.lessonAreaRepository.save(areas);

    return areas.map(area => area.id);
  }
}
