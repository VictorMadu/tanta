import { TestingModuleBuilder } from '@nestjs/testing';
import { WalletService } from 'src/features/wallet/wallet.service';
import { NotificationServiceStub } from './notification.service.stub';
import { WalletServiceStub } from './wallet.service.stub';

export class StubManager {
  private notificationService = new NotificationServiceStub();

  private walletService = new WalletServiceStub();

  addStubsFor(builder: TestingModuleBuilder) {
    return builder
      .overrideProvider(WalletService)
      .useValue(this.walletService)
      .overrideProvider(NotificationServiceStub)
      .useValue(this.notificationService);
  }

  getNotificationService() {
    return this.notificationService;
  }

  getWalletService() {
    return this.walletService;
  }
}
