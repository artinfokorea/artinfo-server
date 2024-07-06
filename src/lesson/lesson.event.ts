import { Injectable } from '@nestjs/common';
import { RedisRepository } from '@/common/redis/redis-repository.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Lesson } from '@/lesson/entity/lesson.entity';

@Injectable()
export class LessonEvent {
  constructor(private readonly redisService: RedisRepository) {}

  @OnEvent('lesson.fetched')
  async handleLessonFetchedEvent(key: string, lesson: Lesson) {
    await this.redisService.setValue({
      key: key,
      value: lesson,
      ttl: 3600,
    });
  }

  @OnEvent('lessons.fetched')
  async handleLessonsFetchedEvent(key: string, lessons: Lesson[]) {
    await this.redisService.setValue({
      key: key,
      value: lessons,
      ttl: 3600,
    });
  }

  @OnEvent('lessons-count.fetched')
  async handleCountLessonsFetchedEvent(key: string, totalCount: number) {
    await this.redisService.setValue({
      key: key,
      value: totalCount,
      ttl: 3600,
    });
  }
}
