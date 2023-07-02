import { Exception } from './exception';
import { ExceptionCode } from './exception-code';

export class Pagination {
  constructor(public readonly offset: number, public readonly limit: number) {
    if (
      offset < 0 ||
      limit < 0 ||
      !Number.isInteger(offset) ||
      !Number.isInteger(limit)
    ) {
      throw new Exception(ExceptionCode.INVALID_PAGINATION);
    }
  }
}
