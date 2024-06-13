import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Lesson } from '@/lesson/entity/lesson.entity';
import { Province } from '@/lesson/entity/province.entity';

@Entity('lessons_provinces')
export class LessonProvince {
  @PrimaryColumn({ name: 'lesson_id' })
  lessonId: number;

  @PrimaryColumn({ name: 'province_id' })
  provinceId: number;

  @ManyToOne(() => Lesson, lesson => lesson.lessonProvinces, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id', referencedColumnName: 'id' })
  lesson: Lesson;

  @ManyToOne(() => Province, province => province.lessonProvinces, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'province_id', referencedColumnName: 'id' })
  province: Province;
}
