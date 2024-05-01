import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class InitiateTransferDto {
  @IsNotEmpty()
  idempotencyKey: string; // required to avoid double request

  @IsNotEmpty()
  @IsMongoId()
  recipient: Types.ObjectId;

  @IsNotEmpty()
  @Type(() => Number)
  amount: number;

  @IsOptional()
  narration?: string;
}

export class WalletTransferResponseDto {
  status: string;
  message: string;
}
