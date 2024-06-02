import { Transform } from 'class-transformer';
import { JOB_TYPE } from '@/job/entity/job.entity';

export function ToNumberArray() {
  return Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(item => {
        const num = Number(item);
        return isNaN(num) ? item : num;
      });
    }
    return value;
  });
}

export function ToArray() {
  return Transform(({ value }) => {
    const isEnum = Object.values(JOB_TYPE).includes(value);
    if (typeof value === 'string' && isEnum) {
      return [value];
    } else {
      return value;
    }
  });
}
