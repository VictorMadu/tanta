import { Test } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { TransactionControl } from 'src/lib/concurrency-control';
import { DateTime } from 'src/lib/date-time';
import { Exception } from 'src/lib/exception';
import { Transaction } from 'src/features/transaction/transaction.entity';
import { Currency } from 'src/features/wallet/currency';
import { WalletCode } from 'src/features/wallet/exception-code';
import { Money } from 'src/features/wallet/money';
import { Wallet } from 'src/features/wallet/wallet.entity';
import { WalletModule } from 'src/features/wallet/wallet.module';
import { WalletService } from 'src/features/wallet/wallet.service';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import { TransactionType } from 'src/features/transaction/transaction-type';

describe('Wallet Module => Creation', () => {
  const userId = uuid.v4();

  let wallet: Wallet;
  let balanceUpdated: Wallet;
  let queryAfterBalanceUpdate: Wallet;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [WalletModule],
    }).compile();

    const walletService = module.get(WalletService);
    const dbManagerService = module.get(DatabaseService);

    // ================  SETUP  ====================
    wallet = await walletService.create({ userId });

    const walletId = wallet.getId();
    const transactions: Transaction[] = [];

    transactions.push(
      new Transaction(
        uuid.v4(),
        wallet.getId(),
        new Money(100, Currency.NGN),
        TransactionType.IN,
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
        TransactionType.IN,
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
      queryAfterBalanceUpdate = await walletService.getWalletById({ walletId });
    } catch (error) {}

    //  ==================== CLEAN UP =========================
    await dbManagerService.cleanTestDatabase();
    await module.close();
  });

  test('Assertion', () => {
    //  ================= ASSERT  ==============
    expect(balanceUpdated).toBeInstanceOf(Wallet);
    expect(wallet).toBeInstanceOf(Wallet);

    expect(wallet.equals(balanceUpdated)).toBe(false);
    expect(balanceUpdated.equals(queryAfterBalanceUpdate)).toBe(true);

    expect(wallet.getId()).toBe(balanceUpdated.getId());
    expect(wallet.getUserId()).toBe(balanceUpdated.getUserId());
    expect(
      wallet.getCreationTime().equals(balanceUpdated.getCreationTime()),
    ).toBe(true);
  });
});
