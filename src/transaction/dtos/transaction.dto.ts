import { Type } from 'class-transformer';
import { IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTransactionDto {
  @IsNotEmpty()
  @Type(() => Number)
  walletBalanceBeforeTransaction: number;

  @IsNotEmpty()
  @Type(() => Number)
  walletBalanceAfterTransaction: number;

  @IsBoolean()
  @IsNotEmpty()
  isCredit: boolean;

  @IsNotEmpty()
  @Type(() => Number)
  amount: number;

  @IsNotEmpty()
  @IsMongoId()
  user: Types.ObjectId;

  @IsNotEmpty()
  transactionHash: string;
}

export class TransactionData {
  amount: number;
  transactionHas: string;
  id: Types.ObjectId;
  isCredit: boolean;
  walletBalanceAfterTransaction: number;
  walletBalanceBeforeTransaction: number;
}

export class GetUserTransactionHistoryResponseDto {
  pages: number;
  total: number;
  current: number;
  data: Array<TransactionData>;
}
