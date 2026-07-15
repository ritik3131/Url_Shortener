import { encodeBase62 } from './base62.js';

const MAX_WORKER_ID = 31;
const MAX_SEQUENCE = 31;

export class SnowflakeCodeGenerator {
  constructor({ workerId, epochSeconds, now = () => Date.now() }) {
    if (!Number.isInteger(workerId) || workerId < 0 || workerId > MAX_WORKER_ID) {
      throw new RangeError('WORKER_ID must be an integer between 0 and 31');
    }
    this.workerId = workerId;
    this.epochSeconds = epochSeconds;
    this.now = now;
    this.lastSecond = -1;
    this.sequence = 0;
  }

  async nextCode() {
    let second = this.secondsSinceEpoch();
    if (second < this.lastSecond) second = this.lastSecond;
    if (second === this.lastSecond) {
      this.sequence += 1;
      if (this.sequence > MAX_SEQUENCE) {
        await this.waitForNextSecond();
        return this.nextCode();
      }
    } else {
      this.lastSecond = second;
      this.sequence = 0;
    }

    const id = (BigInt(second) << 10n) | (BigInt(this.workerId) << 5n) | BigInt(this.sequence);
    return encodeBase62(id).padStart(7, '0');
  }

  secondsSinceEpoch() {
    const seconds = Math.floor(this.now() / 1000) - this.epochSeconds;
    if (seconds < 0 || seconds >= 2 ** 31) throw new RangeError('Timestamp is outside the 31-bit epoch range');
    return seconds;
  }

  async waitForNextSecond() {
    do { await new Promise((resolve) => setTimeout(resolve, 10)); }
    while (this.secondsSinceEpoch() <= this.lastSecond);
  }
}
