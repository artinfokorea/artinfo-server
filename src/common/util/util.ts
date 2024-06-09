export class Util {
  generateRandomNumbers(): string {
    return `${Math.floor(Math.random() * 900000) + 100000}`;
  }
}
