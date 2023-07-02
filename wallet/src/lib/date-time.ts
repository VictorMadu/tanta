export class DateTime {
  private timeInMs: number;

  constructor(time: number | bigint | Date | DateTime) {
    if (time instanceof DateTime) {
      this.timeInMs = time.timeInMs;
    } else if (time instanceof Date) {
      this.timeInMs = time.getTime();
    } else {
      this.timeInMs = parseInt(time.toString());
    }
  }

  private isCompatible(obj: any): obj is number | bigint | Date | DateTime {
    return (
      obj instanceof Date ||
      obj instanceof DateTime ||
      typeof obj === 'number' ||
      typeof obj === 'bigint'
    );
  }

  static now() {
    return new DateTime(Date.now());
  }

  equals(obj: any) {
    if (obj === this) return true;
    if (obj == null) return false;
    if (!this.isCompatible(obj)) return false;

    const other = new DateTime(obj);
    return this.timeInMs === other.timeInMs;
  }

  greaterOrEqual(obj: any) {
    if (obj === this) return true;
    if (obj == null) return false;
    if (!this.isCompatible(obj)) return false;

    const other = new DateTime(obj);
    return this.timeInMs >= other.timeInMs;
  }

  lessOrEqual(obj: any) {
    if (obj === this) return true;
    if (obj == null) return false;
    if (!this.isCompatible(obj)) return false;

    const other = new DateTime(obj);
    return this.timeInMs <= other.timeInMs;
  }

  toDate() {
    return new Date(this.timeInMs);
  }

  toString() {
    return new Date(this.timeInMs).toISOString();
  }
}
