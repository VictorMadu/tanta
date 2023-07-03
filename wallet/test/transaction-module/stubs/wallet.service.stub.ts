import { sleep } from 'src/lib/sleep';
import { Transaction } from 'src/transaction-module/transaction.entity';
import { Wallet } from 'src/wallet-module/wallet.entity';

export class WalletServiceStub {
  private stubStoreManager = new WalletServiceStubSpyier();
  private getByWalletIdStore = new WalletStore();

  async create({ userId }: { userId: string }) {
    console.log('ddddddddddd');
    return Wallet.create({ userId });
  }

  getWalletById({ walletId }: { walletId: string }) {
    console.log('HERE');
    this.stubStoreManager.setWalletByIdArg({ walletId });
    return this.getByWalletIdStore.getWallet();
  }

  getSpyier(): WalletServiceStubSpyier {
    return this.stubStoreManager;
  }

  getWalletStore() {
    return this.getByWalletIdStore;
  }

  async updateBalance({
    walletId,
    transactions,
  }: {
    walletId: string;
    transactions: Transaction[];
  }): Promise<Wallet> {
    console.log('HERE22');

    this.stubStoreManager.setUpdateBalanceArg({ walletId, transactions });
    return this.getByWalletIdStore.getWallet();
  }
}

export class WalletServiceStubSpyier {
  private lastUpdateBalanceArg: UpdateBalanceArg | null = null;
  private noOfSets = 0;

  setUpdateBalanceArg(arg: UpdateBalanceArg) {
    this.lastUpdateBalanceArg = arg;
    this.noOfSets++;
  }

  getLastUpdateBalanceArg(): UpdateBalanceArg | null {
    return this.lastUpdateBalanceArg;
  }

  setWalletByIdArg({ walletId }: { walletId: string }) {
    this.noOfSets++;
  }

  getNoOfCalls() {
    return this.noOfSets;
  }

  reset() {
    this.lastUpdateBalanceArg = null;
    this.noOfSets = 0;
  }
}

export class WalletStore {
  private tempWallet: Wallet | null;

  setWallet(wallet: Wallet) {
    this.tempWallet = wallet;
    return this;
  }

  getWallet() {
    if (this.tempWallet == null) throw new Error();
    return this.tempWallet;
  }
}

export interface UpdateBalanceArg {
  walletId: string;
  transactions: Transaction[];
}
