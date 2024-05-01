import { BadRequestException, Injectable } from '@nestjs/common';
import {
  InitiateTransferDto,
  WalletTransferResponseDto,
} from './dtos/transfer.dto';
import { UserService } from 'src/user/user.service';
import { Types, Connection } from 'mongoose';
import {
  generateTransactionHash,
  nairaToKobo,
} from 'src/common/util/utils.index';
import { InjectConnection } from '@nestjs/mongoose';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class TransferService {
  constructor(
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async initiateWalletTransfer(
    currentUserId: Types.ObjectId,
    payload: InitiateTransferDto,
  ): Promise<WalletTransferResponseDto> {
    const session = await this.connection.startSession();
    session.startTransaction();

    /**
     * make sure users cannot transfer to themselves
     */
    const userIsRecipient = String(currentUserId) === String(payload.recipient);
    if (userIsRecipient)
      throw new BadRequestException(
        'You are not allowed to make a transfer to yourself.',
      );

    /**
     * idempotency:
     *
     * This will fail and will throw under the catch block if the user sends an existing idempotency key
     * This is a better way to make sure users are not repeating transacion maybe cos of network isues or UX bug on the client
     */
    await this.transactionService.createTransactionLog(
      payload,
      currentUserId,
      session,
    );

    /**
     * Note: Amount is expected to be passed in naira as I'm currently doing Kobo conversion
     * s
     * A lot of the validation done here has been explained in the whimsical
     * document provided
     */

    const amountInKobo = nairaToKobo(payload.amount);
    // you dont have to check fo validty if user exist, the findById will either return a data or throw an error
    await this.userService.findById(payload.recipient);

    try {
      /**
       * you might be wondering why I'm searching with both userId and the walletBalance.
       * I'd say experience
       *
       * This is called Atomic Updates (It's the A (atomicity) in the ACID principle)
       *
       * But yeah this is to avoid race conditions, when dealing with payments, you need to avoid
       * saving much data in memory, a user can be signed into two device, if walletBalance is
       * assigned to memory and I'm checking from the assigned variable if user is qualified to initiate a transfer,
       * it can cause the user simulating a transfer multiple times with insuffcient balace, meaning they will qiuckly take advantage of
       * the fact that deviceA is processing and balance hasnt updated in the DB to quickly processs the same tranfer on nDevices (that is unlimited)
       *
       * Note: All users cannot get the same latency hence the API has to be prepared for the worst
       */
      const sender = await this.userService.findOneAndUpdate(
        { _id: currentUserId, walletBalance: { $gte: amountInKobo } },
        { $inc: { walletBalance: -amountInKobo } },
        { session, returnOriginal: true },
      );

      if (!sender) {
        throw new BadRequestException('Insufficient Balance.');
      }

      // Update receiver's wallet
      const receiver = await this.userService.findOneAndUpdate(
        { _id: payload.recipient },
        { $inc: { walletBalance: amountInKobo } },
        { session, returnOriginal: true }, // make this false if u want it to return updatedBalance but for my useCase, I need existing balance
      );

      const transactionHash = generateTransactionHash();

      /**
       * Create a debit transaction history for the sender,
       */
      await this.transactionService.createTransaction(
        {
          isCredit: false,
          walletBalanceAfterTransaction: sender.walletBalance - amountInKobo,
          walletBalanceBeforeTransaction: sender.walletBalance,
          amount: amountInKobo,
          user: sender.id,
          transactionHash,
        },
        session,
      );

      /**
       * Create a credit transaction history for the receiver
       */
      await this.transactionService.createTransaction(
        {
          isCredit: true,
          walletBalanceAfterTransaction: receiver.walletBalance + amountInKobo,
          walletBalanceBeforeTransaction: receiver.walletBalance,
          amount: amountInKobo,
          user: payload.recipient,
          transactionHash,
        },
        session,
      );

      await this.transactionService.markTransactionLogAsCompleted(
        {
          idempotencyKey: payload.idempotencyKey,
          transactionHash,
        },
        session,
      );

      await session.commitTransaction();
      session.endSession();

      return {
        status: 'success',
        message: 'Wallet transfer processed successfully',
      };
    } catch (error) {
      // This will rollback all the updated collections back to their previous state incase an error happened
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
