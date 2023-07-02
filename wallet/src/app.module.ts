import { Module } from '@nestjs/common';
import { WalletModule } from './wallet-module/wallet.module';

@Module({
  imports: [WalletModule],
})
export class AppModule {}
