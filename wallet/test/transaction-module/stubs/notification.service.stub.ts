import { NotifyUser } from 'src/features/notification/notify-user';

export class NotificationServiceStub {
  private stubStoreManager = new NotificationServiceStubSpyier();

  async notifyUser(notifyUser: NotifyUser) {
    this.stubStoreManager.setNotifyUserArg(notifyUser);
  }

  getSpyier(): NotificationServiceStubSpyier {
    return this.stubStoreManager;
  }
}

export class NotificationServiceStubSpyier {
  private lastNotifyUserArg: NotifyUser | null = null;
  private noOfSets = 0;

  setNotifyUserArg(arg: NotifyUser) {
    this.lastNotifyUserArg = arg;
    this.noOfSets++;
  }

  getLastNotifyArg(): NotifyUser | null {
    return this.lastNotifyUserArg;
  }

  getNoOfCalls() {
    return this.noOfSets;
  }
}
