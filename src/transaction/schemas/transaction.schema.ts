import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MSchema } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type TransactionDocument = Transaction & Document;

@Schema({
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
})
export class Transaction {
  @Prop({ type: Number, required: true, default: 0 })
  walletBalanceBeforeTransaction: number;

  @Prop({ type: Number, required: true, default: 0 })
  walletBalanceAfterTransaction: number;

  @Prop({ type: Boolean, required: true })
  isCredit: boolean;

  @Prop({ type: Number })
  amount: number;

  @Prop({ type: MSchema.Types.ObjectId, ref: User.name })
  user: Types.ObjectId; // many-to-one

  /**
   * This is to be able to track transaction history across multiple users.
   * A transaction is tied to the transaction reocrd of both a sender and receivber.
   * You will see this on all fintech apps, its what they use to track transactions incase of dispute or during reconcilation
   */
  @Prop({ type: String, required: true })
  transactionHash: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
