import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from 'src/features/transaction/transaction.service';
import { WalletService } from 'src/features/wallet/wallet.service';
import * as uuid from 'uuid';
import { Money } from 'src/features/wallet/money';
import { Currency } from 'src/features/wallet/currency';
import { Pagination } from 'src/lib/pagination';
import { TransferringService } from 'src/features/transferring/transferring.service';
import {
  FundWalletBodyDto,
  GetWalletQueryDto,
  TransferBodyDto,
  TransferParamDto,
} from './wallet.dto';
import { IdentityAccessUser } from './common/auth.decorator';
import { IdentityAccessGuard } from './common/auth.guard';

@Controller('/api/wallets')
export class WalletController {
  constructor(
    private walletService: WalletService,
    private transactionService: TransactionService,
    private transferringService: TransferringService,
  ) {}

  @Post('')
  @HttpCode(201)
  @UseGuards(IdentityAccessGuard)
  async createWallet(@IdentityAccessUser() userId: string) {
    const wallet = await this.walletService.create({ userId });

    return {
      data: {
        wallet: {
          id: wallet.getId(),
          balance_in_kobo: wallet.getBalanceAsNum(),
          created_at: wallet.getCreationTime().toString(),
          user: {
            id: wallet.getUserId(),
          },
        },
      },
    };
  }

  @Post('/fund')
  @HttpCode(200)
  async fundWallet(@Body() body: FundWalletBodyDto) {
    const transaction = await this.transactionService.credit({
      transactionId: uuid.v4(),
      walletId: body.wallet_id,
      amount: new Money(body.amount_in_kobo, Currency.NGN),
    });

    return {
      data: {
        transaction: {
          id: transaction.getId(),
          amount_in_kobo: transaction.getAmount().getValue(),
          type: transaction.getType(),
          created_at: transaction.getCreationTime().toString(),
        },
      },
    };
  }

  @Get('')
  @HttpCode(200)
  @UseGuards(IdentityAccessGuard)
  async getWallets(
    @IdentityAccessUser() userId: string,
    @Query() query: GetWalletQueryDto,
  ) {
    console.log('Heee', query);
    const wallets = await this.walletService.getWalletsByUser({
      userId,
      pagination: new Pagination(+query.offset, +query.limit),
    });

    return {
      data: {
        wallets: wallets.map((wallet) => ({
          id: wallet.getId(),
          balance: wallet.getBalanceAsNum(),
          created_at: wallet.getCreationTime().toString(),
          user: {
            id: wallet.getUserId(),
          },
        })),
      },
    };
  }

  @Post('/:sender_wallet_id/transfer')
  @HttpCode(200)
  @UseGuards(IdentityAccessGuard)
  async transfer(
    @IdentityAccessUser() userId: string,
    @Param() param: TransferParamDto,
    @Body() body: TransferBodyDto,
  ) {
    const transferring = await this.transferringService.transfer({
      senderUserId: userId,
      senderWalletId: param.sender_wallet_id,
      receiverWalletId: body.receiver_wallet_id,
      amount: new Money(body.amount_in_kobo, Currency.NGN),
      notificationType: body.notification_type,
    });

    return {
      data: {
        transferring: {
          id: transferring.getId(),
          amount_in_kobo: transferring.getAmount().getValue(),
          sender_debit_transaction: {
            id: transferring.getSenderDebitTransactionId(),
          },
          receiver_credit_transaction: {
            id: transferring.getReceiverCreditTransactionId(),
          },
          sender_wallet: {
            id: transferring.getSenderWalletId(),
          },
          receiver_wallet: {
            id: transferring.getReceiverWalletId(),
          },
        },
      },
    };
  }
}
