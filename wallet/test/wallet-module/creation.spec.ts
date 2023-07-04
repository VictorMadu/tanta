import { Test } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { DateTime } from 'src/lib/date-time';
import { BalanceType } from 'src/features/wallet/balance-type';
import { Currency } from 'src/features/wallet/currency';
import { Money } from 'src/features/wallet/money';
import { Wallet } from 'src/features/wallet/wallet.entity';
import { WalletModule } from 'src/features/wallet/wallet.module';
import { WalletService } from 'src/features/wallet/wallet.service';
import * as uuid from 'uuid';

describe('Wallet Module => Creation', () => {
  const userId = uuid.v4();

  let wallet: Wallet;
  let beforeAction: DateTime;
  let afterAction: DateTime;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [WalletModule],
    }).compile();

    const walletService = module.get(WalletService);
    const dbManagerService = module.get(DatabaseService);

    //  ========================== TEST 1 =====================
    beforeAction = DateTime.now();
    try {
      wallet = await walletService.create({ userId });
    } catch (error) {
      console.log('EROR', error);
    }
    afterAction = DateTime.now();

    //  ==================== CLEAN UP =========================
    await dbManagerService.cleanTestDatabase();
    await module.close();
  });

  test('Assertions', () => {
    expect(wallet).toBeInstanceOf(Wallet);
    expect(wallet.getId()).toMatch(/\w+/);
    expect(wallet.getUserId()).toEqual(userId);
    expect(wallet.getCreationTime().greaterOrEqual(beforeAction)).toBe(true);
    expect(wallet.getCreationTime().lessOrEqual(afterAction)).toBe(true);
    expect(wallet.getBalance()).toEqual(new Money(0, Currency.NGN));
    expect(wallet.getBalanceType()).toBe(BalanceType.IDEAL);
    expect(wallet.getLastTransactionVersion()).toBe(0);
  });
});
