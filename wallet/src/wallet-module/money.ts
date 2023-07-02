import { Exception } from 'src/lib/exception';
import { Currency } from './currency';
import { ExceptionCode } from './exception-code';

export class Money {
  // value: is the no/amount of the smallest unit. Eg: $10, 1000 cents value
  constructor(private value: number, private currency: Currency) {
    if (!Number.isInteger(value))
      throw new Exception(ExceptionCode.INVALID_MONEY);
  }

  add(other: Money) {
    if (other.currency !== this.currency)
      throw new Exception(ExceptionCode.INCOMPATIABLE_CURRENCY);

    return new Money(this.value + other.value, this.currency);
  }

  substract(other: Money) {
    if (other.currency !== this.currency)
      throw new Exception(ExceptionCode.INCOMPATIABLE_CURRENCY);

    return new Money(this.value - other.value, this.currency);
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
