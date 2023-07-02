import { Test } from '@nestjs/testing';
import { DbManagerService } from 'src/db-manager/db-manager.service';
import { Exception } from 'src/lib/exception';
import { ExceptionCode } from 'src/lib/exception-code';
import { Pagination } from 'src/lib/pagination';
import { Wallet } from 'src/wallet-module/wallet.entity';
import { WalletModule } from 'src/wallet-module/wallet.module';
import { WalletService } from 'src/wallet-module/wallet.service';
import * as uuid from 'uuid';

describe('Wallet Module => Creation', () => {
  const userId = uuid.v4();

  let wallet1: Wallet;
  let wallet2: Wallet;
  let wallet3: Wallet;
  let wallet4: Wallet;

  let queried1: Wallet[];
  let queried2: Wallet[];
  let queried3: Wallet[];

  let error4: Exception;
  let error5: Exception;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [WalletModule],
    }).compile();

    const walletService = module.get(WalletService);
    const dbManagerService = module.get(DbManagerService);

    // ================  SETUP  ====================
    wallet1 = await walletService.create({ userId });
    wallet2 = await walletService.create({ userId });
    wallet3 = await walletService.create({ userId });
    wallet4 = await walletService.create({ userId });

    //  ========================== TEST 1 =====================
    try {
      queried1 = await walletService.getWalletsByUser({
        userId,
        pagination: new Pagination(0, 10),
      });
    } catch (error) {}

    try {
      queried2 = await walletService.getWalletsByUser({
        userId,
        pagination: new Pagination(3, 4),
      });
    } catch (error) {}

    try {
      queried3 = await walletService.getWalletsByUser({
        userId,
        pagination: new Pagination(4, 10),
      });
    } catch (error) {}

    try {
      await walletService.getWalletsByUser({
        userId,
        pagination: new Pagination(-1, 10),
      });
    } catch (error) {
      error4 = error;
    }

    try {
      await walletService.getWalletsByUser({
        userId,
        pagination: new Pagination(1, -10),
      });
    } catch (error) {
      error5 = error;
    }

    //  ==================== CLEAN UP =========================
    await dbManagerService.cleanTestDatabase();
    await module.close();
  });

  test('Assertion', () => {
    //  ================= ASSERT queried1 ==============
    expect(Array.isArray(queried1)).toBe(true);
    expect(queried1.length).toBe(4);
    expect(queried1[0].equals(wallet1)).toBe(true);
    expect(queried1[1].equals(wallet2)).toBe(true);
    expect(queried1[2].equals(wallet3)).toBe(true);
    expect(queried1[3].equals(wallet4)).toBe(true);

    //  ================= ASSERT queried1 ==============
    expect(Array.isArray(queried2)).toBe(true);
    expect(queried2.length).toBe(1);
    expect(queried2[0].equals(wallet4)).toBe(true);

    //  ================= ASSERT queried1 ==============
    expect(Array.isArray(queried3)).toBe(true);
    expect(queried3.length).toBe(0);

    //  ==================== ASSERT error4 ===============
    expect(error4).toBeInstanceOf(Exception);
    expect(error4.code).toBe(ExceptionCode.INVALID_PAGINATION);

    //  ==================== ASSERT error4 ===============
    expect(error5).toBeInstanceOf(Exception);
    expect(error5.code).toBe(ExceptionCode.INVALID_PAGINATION);
  });
});
