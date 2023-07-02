import { Injectable } from '@nestjs/common';
import { DbManagerService } from 'src/db-manager/db-manager.service';
import { Pagination } from 'src/lib/pagination';
import { Wallet } from './wallet.entity';
import { WalletRepository } from './wallet.repository';

@Injectable()
export class WalletService {
  constructor(private walletRepository: WalletRepository) {}

  async create({ userId }: { userId: string }): Promise<Wallet> {
    const wallet = Wallet.create({ userId });
    await this.walletRepository.save(wallet);

    return wallet;
  }

  async getWalletsByUser({
    userId,
    pagination,
  }: {
    userId: string;
    pagination: Pagination;
  }): Promise<Wallet[]> {
    return this.walletRepository.getWalletsByUser({ userId, pagination });
  }

  getWalletById({ walletId }: { walletId: string }) {
    return this.walletRepository.getWalletById({ walletId });
  }
}
