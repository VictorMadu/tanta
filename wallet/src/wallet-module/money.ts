import { Exception } from 'src/lib/exception';
import { Currency } from './currency';
import { WalletCode } from './exception-code';

export class Money {
  // value: is the no/amount of the smallest unit. Eg: $10, 1000 cents value
  constructor(private value: number, private currency: Currency) {
    if (!Number.isInteger(value)) throw new Exception(WalletCode.INVALID_MONEY);
    if (value < 0) throw new Exception(WalletCode.INVALID_MONEY);
  }

  add(other: Money) {
    if (other.currency !== this.currency)
      throw new Exception(WalletCode.INCOMPATIABLE_CURRENCY);

    return new Money(this.value + other.value, this.currency);
  }

  difference(other: Money) {
    if (other.currency !== this.currency)
      throw new Exception(WalletCode.INCOMPATIABLE_CURRENCY);

    return new Money(Math.abs(this.value - other.value), this.currency);
  }

  multiply(by: number) {
    return new Money(this.value * by, this.currency);
  }

  equals(other: Money) {
    return this.value === other.value && this.currency === other.currency;
  }

  greaterOrEqual(other: Money) {
    return this.value >= other.value && this.currency === other.currency;
  }

  lessOrEqual(other: Money) {
    return this.value <= other.value && this.currency === other.currency;
  }

  lessThan(other: Money) {
    return this.value < other.value && this.currency === other.currency;
  }

  greaterThan(other: Money) {
    return this.value > other.value && this.currency === other.currency;
  }

  getValue() {
    return this.value;
  }

  getCurrency() {
    return this.currency;
  }
}
