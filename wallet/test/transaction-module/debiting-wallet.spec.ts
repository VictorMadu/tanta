import { Test } from '@nestjs/testing';
import { DbManagerService } from 'src/db-manager/db-manager.service';
import { NotificationType } from 'src/notification-module/notification-type';
import { TransactionType } from 'src/transaction-module/transaction-type';
import { Transaction } from 'src/transaction-module/transaction.entity';
import { TransactionModule } from 'src/transaction-module/transaction.module';
import { TransactionService } from 'src/transaction-module/transaction.service';
import { Currency } from 'src/wallet-module/currency';
import { Money } from 'src/wallet-module/money';
import { Wallet } from 'src/wallet-module/wallet.entity';
import { WalletService } from 'src/wallet-module/wallet.service';
import * as uuid from 'uuid';

describe('Transaction Module => Crediting Wallet', () => {
  const balanceAmount1 = new Money(500, Currency.NGN);
  const debitAmount1 = new Money(250, Currency.NGN);

  let wallet: Wallet;

  let wallet1: Wallet;
  let transaction1: Transaction;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TransactionModule],
    }).compile();

    const transactionService = module.get(TransactionService);
    const walletService = module.get(WalletService);
    const dbManagerService = module.get(DbManagerService);

    // ======================== SETUP ===========================
    wallet = await walletService.create({ userId: uuid.v4() });

    //  ========================== TEST  =====================
    try {
      await transactionService.credit({
        walletId: wallet.getId(),
        amount: balanceAmount1,
        senderTransactionId: uuid.v4(),
      });
      console.log(
        'ERRRROR11',
        (
          await walletService.getWalletById({ walletId: wallet.getId() })
        ).getBalance(),
      );
      transaction1 = await transactionService.debit({
        walletId: wallet.getId(),
        amount: debitAmount1,
        senderTransactionId: uuid.v4(),
        notificationType: NotificationType.EMAIL,
      });
      wallet1 = await walletService.getWalletById({ walletId: wallet.getId() });
    } catch (error) {
      console.log('ERRRROR', error);
    }

    //  ==================== CLEAN UP =========================
    await dbManagerService.cleanTestDatabase();
    await module.close();
  });

  test('Assertions', () => {
    //  ========================== ASSERT =========================
    expect(transaction1.getWalletId()).toBe(wallet.getId());
    expect(transaction1.getAmount().equals(new Money(250, Currency.NGN))).toBe(
      true,
    );
    expect(transaction1.getType()).toBe(TransactionType.OUT);

    expect(wallet1.getLastTransactionVersion()).toBe(
      transaction1.getTransactionControl().getVersion(),
    );
  });
});
