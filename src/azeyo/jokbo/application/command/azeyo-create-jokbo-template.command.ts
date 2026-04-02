import { AZEYO_JOKBO_CATEGORY } from '@/azeyo/jokbo/domain/entity/azeyo-jokbo-template.entity';

export class AzeyoCreateJokboTemplateCommand {
  userId: number;
  category: AZEYO_JOKBO_CATEGORY;
  title: string;
  content: string;

  constructor(params: {
    userId: number;
    category: AZEYO_JOKBO_CATEGORY;
    title: string;
    content: string;
  }) {
    Object.assign(this, params);
  }
}
