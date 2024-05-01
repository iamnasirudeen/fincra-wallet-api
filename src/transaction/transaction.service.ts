import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateTransactionDto,
  GetUserTransactionHistoryResponseDto,
  TransactionData,
} from './dtos/transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { ListAllEntities } from 'src/common/entities/entitied.dto';
import {
  ETransactionStatus,
  TransactionLog,
  TransactionLogDocument,
} from './schemas/transction-log.schema';
import { InitiateTransferDto } from 'src/transfer/dtos/transfer.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(TransactionLog.name)
    private readonly transactionLogModel: Model<TransactionLogDocument>,
  ) {}

  async createTransactionLog(
    paylod: InitiateTransferDto,
    initiatedBy: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    // this request will fail if an existing idempotency key is set because idempotency keys are meant to be unique
    try {
      await this.transactionLogModel.create(
        [
          {
            ...paylod,
            transactionStatus: ETransactionStatus.processing,
            initiatedBy,
          },
        ],
        { session },
      );
    } catch (error) {
      /**
       * catch for idempotency error so I can send a custom error message
       */
      if (error.code === 11000) {
        if (error.keyPattern && error.keyPattern.idempotencyKey) {
          throw new BadRequestException(
            'Duplicate Transaction: You have initiated a transaction with this same idempotency key',
          );
        }
      }
      throw new BadRequestException(error);
    }
  }

  async markTransactionLogAsCompleted(
    payload: { idempotencyKey: string; transactionHash: string },
    session: ClientSession,
  ): Promise<void> {
    await this.transactionLogModel.updateOne(
      { idempotencyKey: payload.idempotencyKey },
      {
        transactionStatus: ETransactionStatus.completed,
        transactionHash: payload.transactionHash,
      },
      { session },
    );
  }

  async createTransaction(
    payload: CreateTransactionDto,
    session: ClientSession,
  ): Promise<void> {
    await this.transactionModel.create([payload], { session });
  }

  async viewTransactionHistory(
    currentUserId: Types.ObjectId,
    query: ListAllEntities,
  ): Promise<GetUserTransactionHistoryResponseDto> {
    /**
     * the query is used for pagination
     */
    const { perPage, page } = query;
    const skip = perPage * page - perPage;
    const limit = perPage;
    const transactions = await this.transactionModel
      .find({ user: currentUserId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalTransactions = await this.transactionModel.countDocuments({
      user: currentUserId,
    });

    const pages = Math.ceil(totalTransactions / perPage);
    return {
      data: transactions as unknown as TransactionData[],
      total: totalTransactions,
      pages,
      current: page,
    };
  }
}
