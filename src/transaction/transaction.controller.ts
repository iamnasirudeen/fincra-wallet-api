import { Controller, Get, Query } from '@nestjs/common';
import { GetUserTransactionHistoryResponseDto } from './dtos/transaction.dto';
import { User as CurrentUser } from '../common/decorators/user.decorator';
import { Types } from 'mongoose';
import { ListAllEntities } from 'src/common/entities/entitied.dto';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('history')
  async getUseTransactionHistory(
    @Query() query: ListAllEntities,
    @CurrentUser('id') currentUserId: Types.ObjectId,
  ): Promise<GetUserTransactionHistoryResponseDto> {
    return this.transactionService.viewTransactionHistory(currentUserId, query);
  }
}
