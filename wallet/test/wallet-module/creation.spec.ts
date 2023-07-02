import { Test } from '@nestjs/testing';
import { DbManagerService } from 'src/db-manager/db-manager.service';
import { DateTime } from 'src/lib/date-time';
import { Currency } from 'src/wallet-module/currency';
import { Money } from 'src/wallet-module/money';
import { Wallet } from 'src/wallet-module/wallet.entity';
import { WalletModule } from 'src/wallet-module/wallet.module';
import { WalletService } from 'src/wallet-module/wallet.service';
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
    const dbManagerService = module.get(DbManagerService);

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

  test('Assertion', () => {
    expect(wallet).toBeInstanceOf(Wallet);
    expect(wallet.getId()).toMatch(/\w+/);
    expect(wallet.getUserId()).toEqual(userId);
    expect(wallet.getCreationTime().greaterOrEqual(beforeAction)).toBe(true);
    expect(wallet.getCreationTime().lessOrEqual(afterAction)).toBe(true);
    expect(wallet.getBalance()).toEqual(new Money(0, Currency.NGN));
    expect(wallet.getLastTransactionVersion()).toBe(0);
  });
});
