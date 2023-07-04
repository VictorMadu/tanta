import { Test } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { TransactionControl } from 'src/lib/concurrency-control';
import { DateTime } from 'src/lib/date-time';
import { Transaction } from 'src/features/transaction/transaction.entity';
import { Currency } from 'src/features/wallet/currency';
import { Money } from 'src/features/wallet/money';
import { Wallet } from 'src/features/wallet/wallet.entity';
import { WalletModule } from 'src/features/wallet/wallet.module';
import { WalletService } from 'src/features/wallet/wallet.service';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import { TransactionType } from 'src/features/transaction/transaction-type';
import { BalanceType } from 'src/features/wallet/balance-type';

describe('Wallet Module => Creation', () => {
  let balanceUpdated: Wallet;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [WalletModule],
    }).compile();

    const walletService = module.get(WalletService);
    const dbManagerService = module.get(DatabaseService);

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
        TransactionType.OUT,
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

    console.log(' balanceUpdated.getBalance()', balanceUpdated.getBalance());
    expect(
      balanceUpdated.getBalance().equals(new Money(450, Currency.NGN)),
    ).toBe(true);
    expect(balanceUpdated.getBalanceType()).toBe(BalanceType.OVERDRAFT);
  });
});
