import { Test } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { Exception } from 'src/lib/exception';
import { WalletCode } from 'src/features/wallet/exception-code';
import { Wallet } from 'src/features/wallet/wallet.entity';
import { WalletModule } from 'src/features/wallet/wallet.module';
import { WalletService } from 'src/features/wallet/wallet.service';
import * as uuid from 'uuid';

describe('Wallet Module => Creation', () => {
  const userId = uuid.v4();

  let wallet1: Wallet;
  let wallet2: Wallet;
  let wallet3: Wallet;
  let wallet4: Wallet;

  let queried1: Wallet;
  let queried2: Wallet;

  let error3: Exception;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [WalletModule],
    }).compile();

    const walletService = module.get(WalletService);
    const dbManagerService = module.get(DatabaseService);

    // ================  SETUP  ====================
    wallet1 = await walletService.create({ userId });
    wallet2 = await walletService.create({ userId });
    wallet3 = await walletService.create({ userId });
    wallet4 = await walletService.create({ userId });

    //  ========================== TEST 1 =====================
    try {
      queried1 = await walletService.getWalletById({
        walletId: wallet1.getId(),
      });
    } catch (error) {}

    try {
      queried2 = await walletService.getWalletById({
        walletId: wallet2.getId(),
      });
    } catch (error) {}

    try {
      await walletService.getWalletById({
        walletId: uuid.v4(),
      });
    } catch (error) {
      error3 = error;
    }

    //  ==================== CLEAN UP =========================
    await dbManagerService.cleanTestDatabase();
    await module.close();
  });

  test('Assertion', () => {
    //  ================= ASSERT queried1 ==============
    expect(queried1).toBeInstanceOf(Wallet);
    expect(queried1.equals(wallet1)).toBe(true);

    //  ================= ASSERT queried2 ==============
    expect(queried2).toBeInstanceOf(Wallet);
    expect(queried2.equals(wallet2)).toBe(true);

    //  ==================== ASSERT error3 ===============
    expect(error3).toBeInstanceOf(Exception);
    expect(error3.code).toBe(WalletCode.NOT_FOUND);
  });
});
