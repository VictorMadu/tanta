import { Test } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { Exception } from 'src/lib/exception';
import { NotificationType } from 'src/features/notification/notification-type';
import { TransactionCode } from 'src/features/transaction/exception-code';
import { Transaction } from 'src/features/transaction/transaction.entity';
import { TransactionModule } from 'src/features/transaction/transaction.module';
import { TransactionService } from 'src/features/transaction/transaction.service';
import { Currency } from 'src/features/wallet/currency';
import { Money } from 'src/features/wallet/money';
import { Wallet } from 'src/features/wallet/wallet.entity';
import { WalletService } from 'src/features/wallet/wallet.service';
import * as uuid from 'uuid';

describe('Transaction Module => Over debiting Wallet', () => {
  const userId = uuid.v4();
  const balanceAmount = new Money(5000, Currency.NGN);
  const debitAmount = new Money(5001, Currency.NGN);

  let transaction: Transaction;
  let wallet: Wallet;

  let wallet1: Wallet;

  let error: Exception;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TransactionModule],
    }).compile();

    const transactionService = module.get(TransactionService);
    const walletService = module.get(WalletService);
    const dbManagerService = module.get(DatabaseService);

    // ======================== SETUP ===========================
    wallet = await walletService.create({ userId });

    transaction = await transactionService.credit({
      walletId: wallet.getId(),
      amount: balanceAmount,
      senderTransactionId: uuid.v4(),
    });

    //  ========================== TEST  =====================
    try {
      await transactionService.debit({
        walletId: wallet.getId(),
        amount: debitAmount,
        notificationType: NotificationType.EMAIL,
        senderTransactionId: uuid.v4(),
      });
    } catch (e) {
      error = e;
    }

    wallet1 = await walletService.getWalletById({ walletId: wallet.getId() });

    //  ==================== CLEAN UP =========================
    await dbManagerService.cleanTestDatabase();
    await module.close();
  });

  test('Assertions', () => {
    //  ========================== ASSERT 1 =========================
    expect(error).toBeInstanceOf(Exception);
    expect(error.code).toBe(TransactionCode.INSUFFICIENT_FUND);

    //  ========================== ASSERT 2 =========================
    true;
    expect(wallet1.getLastTransactionVersion()).toBe(
      transaction.getTransactionControl().getVersion(),
    );

    // expect(notificationService.getSpyier().getNoOfCalls()).toBe(1);
    // expect(notificationService.getSpyier().getLastNotifyArg()).toEqual({
    //   userId,
    //   message: 'Your automated deposit failed due to insufficient funds',
    //   notificationType: NotificationType.EMAIL,
    // });
  });
});
