export class TransactionControl {
  getVersion() {
    return this.version;
  }

  incrementVersion() {
    this.version++;
    return this;
  }

  isNew() {
    return this.version < 2;
  }

  clone() {
    return new TransactionControl(this.version);
  }

  static init() {
    return TransactionControl.fromVersion();
  }

  static fromState(isNew: boolean) {
    if (isNew) return new TransactionControl(1);
    else return new TransactionControl(2);
  }

  static fromVersion(version: number = 0) {
    return new TransactionControl(version);
  }

  private constructor(private version: number) {}
}
