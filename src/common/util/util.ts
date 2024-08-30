export class Util {
  convertToUTC(koreanDateString: string): Date {
    const [year, month, day] = koreanDateString.split('.').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  }

  generateRandomNumbers(): string {
    return `${Math.floor(Math.random() * 900000) + 100000}`;
  }

  generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let str = '';
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
  }

  getRedisKey(prefix: string, values: any) {
    let key = prefix;
    if (typeof values !== 'object') {
      return (key += values);
    }

    for (const el of Object.values(values)) {
      if (Array.isArray(el)) {
        key += el.reduce((acc, cur) => {
          if (isNaN(cur)) {
            return acc + cur[0].toLowerCase();
          } else {
            return acc + String(cur).toLowerCase();
          }
        }, '');

        continue;
      }

      if (typeof el !== 'object') {
        key += String(el).toLowerCase();
      }
    }

    return key;
  }
}
