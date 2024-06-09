export class RedisSetCommand {
  key: string;
  value: any;
  ttl: number;

  constructor(data: RedisSetCommand) {
    this.key = data.key;
    this.value = data.value;
    this.ttl = data.ttl;
  }
}
