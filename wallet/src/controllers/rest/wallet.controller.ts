import { Controller, Headers } from '@nestjs/common';

@Controller()
export class WalletController {
  async createWallet(@Headers() headers: HeaderDto) {}
}

export class HeaderDto {}
