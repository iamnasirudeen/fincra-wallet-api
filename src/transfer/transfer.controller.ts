import { Body, Controller, Post } from '@nestjs/common';
import {
  InitiateTransferDto,
  WalletTransferResponseDto,
} from './dtos/transfer.dto';
import { TransferService } from './transfer.service';
import { User as CurrentUser } from '../common/decorators/user.decorator';
import { Types } from 'mongoose';

@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post('initiate')
  async initiateWalletTransfer(
    @Body() payload: InitiateTransferDto,
    @CurrentUser('id') currentUserId: Types.ObjectId,
  ): Promise<WalletTransferResponseDto> {
    return this.transferService.initiateWalletTransfer(currentUserId, payload);
  }
}
