import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'ohh, you finally made it to my version of the Fincra Wallet API, Welcome!';
  }
}
