import { Test } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { NotificationService } from 'src/features/notification/notification.service';
import { TransactionType } from 'src/features/transaction/transaction-type';
import { Transaction } from 'src/features/transaction/transaction.entity';
import { TransactionModule } from 'src/features/transaction/transaction.module';
import { TransactionService } from 'src/features/transaction/transaction.service';
import { Currency } from 'src/features/wallet/currency';
import { Money } from 'src/features/wallet/money';
import { Wallet } from 'src/features/wallet/wallet.entity';
import { WalletService } from 'src/features/wallet/wallet.service';
import * as uuid from 'uuid';

describe('Transaction Module => Crediting Wallet', () => {
  const amount = new Money(500 * 100, Currency.NGN);

  let wallet: Wallet;

  let transaction1: Transaction;
  let wallet1: Wallet;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TransactionModule],
    }).compile();

    const transactionService = module.get(TransactionService);
    const walletService = module.get(WalletService);
    const dbManagerService = module.get(DatabaseService);

    // ======================== SETUP ===========================
    wallet = await walletService.create({ userId: uuid.v4() });

    //  ========================== TEST 1 =====================
    try {
      transaction1 = await transactionService.credit({
        walletId: wallet.getId(),
        amount,
        transactionId: uuid.v4(),
      });
      wallet1 = await walletService.getWalletById({ walletId: wallet.getId() });
    } catch (error) {
      console.log('ERROR', error);
    }

    //  ==================== CLEAN UP =========================
    await dbManagerService.cleanTestDatabase();
    await module.close();
  });

  test('Assertions', () => {
    expect(transaction1.getWalletId()).toBe(wallet.getId());
    expect(transaction1.getAmount().equals(amount)).toBe(true);
    expect(transaction1.getType()).toBe(TransactionType.IN);

    expect(wallet1.getLastTransactionVersion()).toBe(
      transaction1.getTransactionControl().getVersion(),
    );
  });
});
