import { Test } from '@nestjs/testing';
import { DbManagerService } from 'src/db-manager/db-manager.service';
import { TransactionControl } from 'src/lib/concurrency-control';
import { DateTime } from 'src/lib/date-time';
import { Exception } from 'src/lib/exception';
import { Transaction } from 'src/transaction-module/transaction.entity';
import { Currency } from 'src/wallet-module/currency';
import { WalletCode } from 'src/wallet-module/exception-code';
import { Money } from 'src/wallet-module/money';
import { Wallet } from 'src/wallet-module/wallet.entity';
import { WalletModule } from 'src/wallet-module/wallet.module';
import { WalletService } from 'src/wallet-module/wallet.service';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import { TransactionType } from 'src/transaction-module/transaction-type';
import { BalanceType } from 'src/wallet-module/balance-type';

describe('Wallet Module => Creation', () => {
  let balanceUpdated: Wallet;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [WalletModule],
    }).compile();

    const walletService = module.get(WalletService);
    const dbManagerService = module.get(DbManagerService);

    // ================  SETUP  ====================
    const wallet = await walletService.create({ userId: uuid.v4() });

    const transactions: Transaction[] = [];

    transactions.push(
      new Transaction(
        uuid.v4(),
        wallet.getId(),
        new Money(100, Currency.NGN),
        TransactionType.OUT,
        DateTime.now(),
        TransactionControl.fromVersion(1),
      ),
    );

    transactions.push(
      new Transaction(
        uuid.v4(),
        wallet.getId(),
        new Money(150, Currency.NGN),
        TransactionType.IN,
        DateTime.now(),
        TransactionControl.fromVersion(2),
      ),
    );

    transactions.push(
      new Transaction(
        uuid.v4(),
        wallet.getId(),
        new Money(200, Currency.NGN),
        TransactionType.OUT,
        DateTime.now(),
        TransactionControl.fromVersion(3),
      ),
    );

    //  ========================== TEST  =====================

    try {
      balanceUpdated = await walletService.updateBalance({
        walletId: wallet.getId(),
        transactions,
      });
    } catch (error) {}

    //  ==================== CLEAN UP =========================
    await dbManagerService.cleanTestDatabase();
    await module.close();
  });

  test('Assertion', () => {
    //  ================= ASSERT  ==============
    expect(balanceUpdated).toBeInstanceOf(Wallet);
    expect(
      balanceUpdated.getBalance().equals(new Money(150, Currency.NGN)),
    ).toBe(true);
    expect(balanceUpdated.getBalanceType()).toBe(BalanceType.OVERDRAFT);
  });
});
