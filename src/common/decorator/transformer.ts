import { Transform } from 'class-transformer';

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
