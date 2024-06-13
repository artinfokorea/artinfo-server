import { Transform } from 'class-transformer';

export function ToNumberArray() {
  return Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(item => {
        const num = Number(item);
        return isNaN(num) ? item : num;
      });
    } else if (typeof value === 'string' && !isNaN(Number(value))) {
      return [Number(value)];
    }
    return value;
  });
}

export function ToArray() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }

    return value;
  });
}

export function ToNumber() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;
    }

    return value;
  });
}
